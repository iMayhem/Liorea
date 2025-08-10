// src/app/jamnight/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Music, Clipboard, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, collection, addDoc, query, orderBy, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDebouncedCallback } from 'use-debounce';
import type { ChatMessage, Participant } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/lib/firestore';


type PlayerState = 'PLAYING' | 'PAUSED' | 'BUFFERING';

interface JamRoomState {
    currentVideoId: string;
    playerState: PlayerState;
    lastSeekTimestamp: any;
    lastSeekTimeSeconds: number;
    typingUsers?: { [uid: string]: string };
    participants?: Participant[];
}

const PUBLIC_JAMNIGHT_ROOM_ID = "public-jamnight-room-v1";

export default function JamRoomPage({ params }: { params: { roomId: string } }) {
    const routeParams = React.use(params as any);
    const { roomId } = routeParams;
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [roomState, setRoomState] = React.useState<JamRoomState | null>(null);
    const [videoUrl, setVideoUrl] = React.useState('');
    const playerRef = React.useRef<YouTubePlayer | null>(null);
    const isLocalChangeRef = React.useRef(false); // To prevent feedback loops
    const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);


    // Function to parse YouTube video ID from URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Firestore update function
    const updateRoomState = async (newState: Partial<JamRoomState>) => {
        if (!roomId) return;
        isLocalChangeRef.current = true;
        const roomRef = doc(db, 'jamRooms', roomId);
        await updateDoc(roomRef, newState);
        // Allow remote changes to be processed after a short delay
        setTimeout(() => { isLocalChangeRef.current = false; }, 500);
    };
    
    const debouncedSeekUpdate = useDebouncedCallback(async (time: number) => {
        await updateRoomState({ lastSeekTimeSeconds: time, lastSeekTimestamp: serverTimestamp() });
    }, 1000);


    // Effect to handle joining/leaving the room and listening for state changes
    React.useEffect(() => {
        if (authLoading || !user || !profile) return;

        const roomRef = doc(db, 'jamRooms', roomId);
        const chatQuery = query(collection(db, 'jamRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));

        // Check if room exists
        getDoc(roomRef).then(async (docSnap) => {
            if (!docSnap.exists()) {
                toast({ title: "Error", description: "Jam room not found.", variant: "destructive" });
                router.push('/jamnight');
                return;
            }
            // Add user to participants list
            await updateDoc(roomRef, { participants: arrayUnion({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }) });
            // Update user's status to indicate they are in a jam session
            await updateUserProfile(user.uid, { status: { isStudying: false, isJamming: true, roomId: roomId } });
        });

        const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
            if (isLocalChangeRef.current) return;
            const data = doc.data() as JamRoomState;
            setRoomState(data);

            const player = playerRef.current;
            if(!player || !data) return;

            const currentPlayerState = player.getPlayerState();
            
            // Only seek if the difference is significant to avoid jitter
            if (data.lastSeekTimeSeconds && Math.abs(data.lastSeekTimeSeconds - player.getCurrentTime()) > 2) {
                player.seekTo(data.lastSeekTimeSeconds, true);
            }

            if (data.playerState === 'PLAYING' && currentPlayerState !== 1) {
                player.playVideo();
            } else if (data.playerState === 'PAUSED' && currentPlayerState !== 2) {
                player.pauseVideo();
            }
        });

        const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        // Cleanup on unmount
        return () => {
            unsubscribeRoom();
            unsubscribeChat();
            if (user && profile) {
                getDoc(roomRef).then(docSnap => {
                    if(docSnap.exists()) {
                        updateDoc(roomRef, { 
                            participants: arrayRemove({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }),
                            [`typingUsers.${user.uid}`]: deleteField()
                        });
                    }
                })
                // Reset user's status when they leave
                updateUserProfile(user.uid, { status: { isStudying: false, isJamming: false, roomId: null } });
            }
        };

    }, [roomId, user, profile, authLoading, router, toast]);

    const handleVideoUrlChange = () => {
        const videoId = getYouTubeId(videoUrl);
        if (videoId) {
            updateRoomState({ currentVideoId: videoId });
        } else {
            toast({ title: "Invalid URL", description: "Please enter a valid YouTube video URL.", variant: "destructive" });
        }
    };
    
    const onPlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
        // Sync to server state once player is ready
        if (roomState) {
            if (playerRef.current?.seekTo) {
                playerRef.current.seekTo(roomState.lastSeekTimeSeconds, true);
            }
            if (roomState.playerState === 'PLAYING') {
                playerRef.current?.playVideo();
            }
        }
    };
    
    const onPlayerStateChange = (event: { data: number }) => {
        switch (event.data) {
            case 1: // Playing
                updateRoomState({ playerState: 'PLAYING' });
                // When starting to play, also sync the current time
                if(playerRef.current?.getCurrentTime) {
                    debouncedSeekUpdate(playerRef.current.getCurrentTime());
                }
                break;
            case 2: // Paused
                updateRoomState({ playerState: 'PAUSED' });
                break;
        }
    };
    
    // Interval to sync seek time periodically, since there's no direct 'onSeek' event
    React.useEffect(() => {
        const interval = setInterval(() => {
            // Only the person playing the video should be sending seek updates
            if (playerRef.current && playerRef.current.getPlayerState && playerRef.current.getPlayerState() === 1) { 
                 if(playerRef.current?.getCurrentTime) {
                    const currentTime = playerRef.current.getCurrentTime();
                    debouncedSeekUpdate(currentTime);
                }
            }
        }, 5000); // Sync every 5 seconds
        return () => clearInterval(interval);
    }, [debouncedSeekUpdate]);

     const handleSendMessage = async (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => {
        if (!user || !profile?.username || !roomId) return;
        const chatCollectionRef = collection(db, 'jamRooms', roomId, 'chats');
        
        if(!message.text && !message.imageUrl) return;

        const messageData: any = {
          text: message.text,
          imageUrl: message.imageUrl || null,
          senderId: user.uid,
          senderName: profile.username,
          timestamp: serverTimestamp(),
        };

        if (replyTo) {
          messageData.replyToId = replyTo.id;
          messageData.replyToText = replyTo.text;
        }
        
        await addDoc(chatCollectionRef, messageData);
    };

    const handleTyping = async (isTyping: boolean) => {
        if (!user || !profile?.username || !roomId) return;
        const roomRef = doc(db, 'jamRooms', roomId);
        const typingField = `typingUsers.${user.uid}`;

        try {
            if (isTyping) {
                await updateDoc(roomRef, { [typingField]: profile.username });
            } else {
                await updateDoc(roomRef, { [typingField]: deleteField() });
            }
        } catch(error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update typing status:", error);
            }
        }
    };


    if (authLoading || !roomState || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div 
            className="flex flex-col h-screen" 
        >
            <AppHeader />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-rows-[1fr_auto] gap-6">
                <div className="lg:grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                         <Card className="aspect-video w-full h-full overflow-hidden">
                            <YouTube
                                videoId={roomState.currentVideoId}
                                onReady={onPlayerReady}
                                onStateChange={onPlayerStateChange}
                                opts={{
                                    height: '100%',
                                    width: '100%',
                                    playerVars: {
                                        autoplay: 0,
                                        controls: 1,
                                    },
                                }}
                                className="w-full h-full"
                            />
                        </Card>
                    </div>
                    <div className="lg:col-span-1 h-full flex flex-col min-h-0 mt-6 lg:mt-0">
                         <GroupChat
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            currentUserId={user!.uid}
                            onTyping={handleTyping}
                            typingUsers={roomState.typingUsers || {}}
                        />
                    </div>
                </div>
                <div className="lg:grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex gap-2">
                                    <Input
                                        id="youtube-url"
                                        placeholder="Paste a YouTube URL"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                    />
                                    <Button onClick={handleVideoUrlChange}>Set</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
