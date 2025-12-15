"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove, onDisconnect } from 'firebase/database';

interface ScreenShareContextType {
    startSharing: (roomId: string) => Promise<void>;
    stopSharing: () => void;
    joinStream: (roomId: string) => void;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isSharing: boolean;
    isViewing: boolean;
    error: string | null;
}

const ScreenShareContext = createContext<ScreenShareContextType | undefined>(undefined);

const SERVERS = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:standard.relay.metered.ca:80",
            username: "74ba25a723d27c303a52e8d2",
            credential: "Ho7GkPMhUtlsEHWD",
        },
        {
            urls: "turn:standard.relay.metered.ca:80?transport=tcp",
            username: "74ba25a723d27c303a52e8d2",
            credential: "Ho7GkPMhUtlsEHWD",
        },
        {
            urls: "turn:standard.relay.metered.ca:443",
            username: "74ba25a723d27c303a52e8d2",
            credential: "Ho7GkPMhUtlsEHWD",
        },
        {
            urls: "turns:standard.relay.metered.ca:443?transport=tcp",
            username: "74ba25a723d27c303a52e8d2",
            credential: "Ho7GkPMhUtlsEHWD",
        },
    ],
    iceCandidatePoolSize: 10,
};

export const ScreenShareProvider = ({ children }: { children: React.ReactNode }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for non-react state WebRTC objects
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const activeRoomId = useRef<string | null>(null);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setIsSharing(false);
        setIsViewing(false);
        setError(null);
    }, []);

    const startSharing = useCallback(async (roomId: string) => {
        try {
            cleanup();
            activeRoomId.current = roomId;

            // 1. Get Screen Stream
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" } as any,
                audio: false
            });

            setLocalStream(stream);
            streamRef.current = stream;
            setIsSharing(true);

            // Stop sharing when user clicks generic browser "Stop Sharing" button
            stream.getVideoTracks()[0].onended = () => {
                stopSharing();
            };

            // 2. Setup Signaling in Firebase
            // We use a simplified 'host' model where the broadcaster creates the offer.
            // In a real mesh, we'd need separate offers per peer.
            // FOR THIS EXPERIMENT: We will broadcast ONE offer that multiple people might try to answer, 
            // but standard WebRTC is 1:1. 
            // TO MAKE IT WORK FOR MULTIPLE VIEWERS efficiently we need a slightly smarter loop, 
            // but for a "Hidden Test", let's do:
            // "Public Offer" -> Listen for "Answers" -> New PC per answer? 
            // Actually, simplest 1-to-1 test first:
            // Just putting the offer in DB. 

            // WAIT - Standard WebRTC is Peer-to-Peer. 1 Host -> N Viewers requires N PeerConnections on Host.
            // Let's implement that: Host listens for 'viewers' joining, and initiates a connection to EACH.

            // SIGNALING PATHS:
            // /screenshare/<roomId>/host_presence : Host heartbeat
            // /screenshare/<roomId>/viewers/<viewerId> : Viewer announces presence
            // /screenshare/<roomId>/offers/<viewerId> : Host sends offer to specific viewer
            // /screenshare/<roomId>/answers/<viewerId> : Viewer answers host
            // /screenshare/<roomId>/ice/<viewerId>/host : Host candidates for viewer
            // /screenshare/<roomId>/ice/<viewerId>/viewer : Viewer candidates for host

            // SIMPLIFIED MVP for 1:1 (or just 1 connection for now to prove concept easily)
            // Let's try the robust way: Host creates PC when it detects a viewer.

            // Register Host Presence
            const hostRef = ref(db, `screenshare/${roomId}/host`);
            set(hostRef, { active: true, timestamp: Date.now() });
            onDisconnect(hostRef).remove();

            // Listen for Viewers
            const viewersRef = ref(db, `screenshare/${roomId}/viewers`);
            // Removing old viewers on new session start
            remove(viewersRef);

            onValue(viewersRef, (snapshot) => {
                snapshot.forEach((child) => {
                    const viewerId = child.key;
                    if (viewerId && !peerConnection.current) {
                        // FOR MVP: Only accept ONE viewer for stability in first pass.
                        // Or we can try to support multiple but let's be safe.
                        // Actually, let's allow the 'last' one or just one.
                        initiateConnectionToViewer(roomId, viewerId, stream);
                    }
                });
            });

        } catch (err: any) {
            console.error("Error starting screen share:", err);
            setError(err.message || "Failed to start screen share");
            cleanup();
        }
    }, [cleanup]); // dependencies

    const initiateConnectionToViewer = async (roomId: string, viewerId: string, stream: MediaStream) => {
        console.log("Initiating connection to viewer:", viewerId);
        const pc = new RTCPeerConnection(SERVERS);
        peerConnection.current = pc; // Track current PC

        // Add Tracks
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidatesRef = ref(db, `screenshare/${roomId}/candidates/${viewerId}/host`);
                push(candidatesRef, event.candidate.toJSON());
            }
        };

        // Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const offerRef = ref(db, `screenshare/${roomId}/offers/${viewerId}`);
        await set(offerRef, { type: offer.type, sdp: offer.sdp });

        // Listen for Answer
        const answerRef = ref(db, `screenshare/${roomId}/answers/${viewerId}`);
        onValue(answerRef, async (snapshot) => {
            const data = snapshot.val();
            if (!pc.currentRemoteDescription && data && data.sdp) {
                const answer = new RTCSessionDescription(data);
                await pc.setRemoteDescription(answer);
            }
        });

        // Listen for Viewer ICE
        const viewerIceRef = ref(db, `screenshare/${roomId}/candidates/${viewerId}/viewer`);
        onValue(viewerIceRef, (snapshot) => {
            snapshot.forEach((child) => {
                if (pc.remoteDescription) {
                    pc.addIceCandidate(new RTCIceCandidate(child.val()));
                }
            });
        });
    };

    const stopSharing = useCallback(() => {
        if (activeRoomId.current) {
            // Clean DB
            remove(ref(db, `screenshare/${activeRoomId.current}`));
        }
        cleanup();
    }, [cleanup]);

    const joinStream = useCallback(async (roomId: string) => {
        cleanup();
        activeRoomId.current = roomId;
        setIsViewing(true);

        const viewerId = `viewer_${Math.random().toString(36).substr(2, 9)}`;
        console.log("Joining as viewer:", viewerId);

        const pc = new RTCPeerConnection(SERVERS);
        peerConnection.current = pc;

        pc.ontrack = (event) => {
            console.log("Received remote track");
            event.streams[0].getTracks().forEach(track => {
                console.log("Track kind:", track.kind, "Enabled:", track.enabled);
            });
            setRemoteStream(event.streams[0]);
        };

        // ICE
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidatesRef = ref(db, `screenshare/${roomId}/candidates/${viewerId}/viewer`);
                push(candidatesRef, event.candidate.toJSON());
            }
        };

        // Announce Presence
        const viewerRef = ref(db, `screenshare/${roomId}/viewers/${viewerId}`);
        set(viewerRef, { active: true });
        onDisconnect(viewerRef).remove();

        // Listen for Offer
        const offerRef = ref(db, `screenshare/${roomId}/offers/${viewerId}`);
        onValue(offerRef, async (snapshot) => {
            const data = snapshot.val();
            if (!pc.currentRemoteDescription && data && data.sdp) {
                console.log("Received Offer");
                const offer = new RTCSessionDescription(data);
                await pc.setRemoteDescription(offer);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                const answerRef = ref(db, `screenshare/${roomId}/answers/${viewerId}`);
                set(answerRef, { type: answer.type, sdp: answer.sdp });
            }
        });

        // Listen for Host ICE
        const hostIceRef = ref(db, `screenshare/${roomId}/candidates/${viewerId}/host`);
        onValue(hostIceRef, (snapshot) => {
            snapshot.forEach((child) => {
                if (pc.remoteDescription) {
                    pc.addIceCandidate(new RTCIceCandidate(child.val()));
                }
            });
        });

    }, [cleanup]);

    return (
        <ScreenShareContext.Provider value={{
            startSharing,
            stopSharing,
            joinStream,
            localStream,
            remoteStream,
            isSharing,
            isViewing,
            error
        }}>
            {children}
        </ScreenShareContext.Provider>
    );
};

export const useScreenShare = () => {
    const context = useContext(ScreenShareContext);
    if (context === undefined) {
        throw new Error('useScreenShare must be used within a ScreenShareProvider');
    }
    return context;
};
