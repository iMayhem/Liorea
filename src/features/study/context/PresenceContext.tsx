"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db, firestore } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove, query, limitToLast } from 'firebase/database';
import {
    collection,
    query as queryFirestore,
    where,
    orderBy,
    limit as limitFirestore,
    onSnapshot,
    doc,
    setDoc,
    increment as incrementFirestore,
    serverTimestamp as serverTimestampFirestore
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import { api } from '@/lib/api';

export interface StudyUser {
    username: string;
    total_study_time: number;
    status: 'Online';
    photoURL?: string;
    status_text?: string;
    equipped_frame?: string;
    trend?: 'up' | 'down' | 'same';
}

export interface CommunityUser {
    username: string;
    status: 'Online' | 'Offline';
    last_seen: number;
    status_text?: string;
    is_studying: boolean;
    photoURL?: string;
    equipped_frame?: string;
}

interface PresenceContextType {
    username: string | null;
    userImage: string | null;
    setUsername: (name: string | null) => void;
    setUserImage: (url: string | null) => void;
    studyUsers: StudyUser[];
    communityUsers: CommunityUser[];
    leaderboardUsers: StudyUser[];
    isStudying: boolean;
    joinSession: (roomId?: string) => void;
    leaveSession: (roomId?: string) => void;
    joinedRoomId: string | null;
    updateStatusMessage: (msg: string) => Promise<void>;
    getUserImage: (username: string) => string | undefined;

    getUserFrame: (username: string) => string | undefined;
    userRoles: Record<string, string>;
    isMod: (username: string) => boolean;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsernameState] = useState<string | null>(null);
    const [userImage, setUserImageState] = useState<string | null>(null);
    const [userFrame, setUserFrameState] = useState<string | null>(null);

    const setUserImage = useCallback((url: string | null) => {
        setUserImageState(url);
        if (url) localStorage.setItem('liorea-user-image', url);
        else localStorage.removeItem('liorea-user-image');
    }, []);

    const [studyUsers, setStudyUsers] = useState<StudyUser[]>([]);
    const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
    const [historicalLeaderboard, setHistoricalLeaderboard] = useState<StudyUser[]>([]);
    const [userRoles, setUserRoles] = useState<Record<string, string>>({});

    const [isStudying, setIsStudying] = useState(false);
    const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
    const unsavedMinutesRef = useRef(0);
    const { toast } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem('liorea-username');
        const storedImage = localStorage.getItem('liorea-user-image');
        if (storedUser) setUsernameState(storedUser);
        if (storedImage) setUserImageState(storedImage); // Load immediately
    }, []);

    const setUsername = useCallback((name: string | null) => {
        setUsernameState(name);
        if (name) {
            localStorage.setItem('liorea-username', name);
        } else {
            if (username) {
                remove(ref(db, `/study_room_presence/${username}`));
                update(ref(db, `/community_presence/${username}`), {
                    status: 'Offline',
                    last_seen: serverTimestamp(),
                    is_studying: false
                });
            }
            localStorage.removeItem('liorea-username');
            localStorage.removeItem('liorea-user-image');
            setUserImage(null);
            setUserFrameState(null);
            setIsStudying(false);
        }
    }, [username]);

    // --- GLOBAL PRESENCE (Write) ---
    useEffect(() => {
        if (!username) return;

        // 1. Realtime DB: Ephemeral Status
        const commRef = ref(db, `/community_presence/${username}`);
        const connectionRef = ref(db, '.info/connected');

        // 2. Firestore: Persistent Profile
        const userRef = doc(firestore, 'users', username);

        const unsubscribe = onValue(connectionRef, async (snap: any) => {
            if (snap.val() === true) {
                // Fetch latest profile data from D1 to ensure Firestore is up to date on connect
                let savedStatus = "";
                let savedPhoto = userImage || "";
                let savedFrame = userFrame || "";

                try {
                    // SYNC FROM D1 (Source of Truth)
                    const data = await api.auth.getStatus(username);
                    if (data.status_text) savedStatus = data.status_text;
                    if (data.photoURL) {
                        savedPhoto = data.photoURL;
                        setUserImage(savedPhoto); // Sync to local state
                    }
                    if (data.equipped_frame) {
                        savedFrame = data.equipped_frame;
                        setUserFrameState(savedFrame);
                    }

                    // SYNC TO FIRESTORE (Read Replica for Realtime)
                    await setDoc(userRef, {
                        username,
                        photoURL: savedPhoto,
                        equipped_frame: savedFrame,
                        last_seen: serverTimestampFirestore(),
                        status_text: savedStatus // Sync status too
                    }, { merge: true });

                    // Also update Realtime DB for "I am here"
                    await onDisconnect(commRef).update({
                        status: 'Offline',
                        last_seen: serverTimestamp(),
                        is_studying: false
                    });

                    update(commRef, {
                        username: username, // key for identification
                        status: 'Online',
                        last_seen: serverTimestamp(),
                        is_studying: false // Default false until joinSession
                    });

                } catch (e) { console.error("Presence sync failed", e); }
            }
        });

        return () => {
            unsubscribe();
            onDisconnect(commRef).cancel();
        };
    }, [username, userImage, userFrame]);

    // --- DATA LISTENERS ---

    // 0. Firestore Users List (Profile Data Source)
    // We listen to ALL users (assuming reasonable scale) or we could query.
    // Ideally we only fetch profiles of online users, but for now we'll listen to the collection to get updates.
    const [firestoreProfiles, setFirestoreProfiles] = useState<Map<string, any>>(new Map());
    useEffect(() => {
        const q = queryFirestore(collection(firestore, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const map = new Map<string, any>();
            snapshot.docs.forEach(doc => {
                map.set(doc.id, doc.data());
            });
            setFirestoreProfiles(map);
        });
        return () => unsubscribe();
    }, []);

    // 1. Leaderboard (Live from Firestore 'daily_stats')
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const q = queryFirestore(
            collection(firestore, 'daily_stats'),
            where('date', '==', today),
            orderBy('minutes', 'desc'),
            limitFirestore(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: StudyUser[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    username: data.username,
                    total_study_time: (data.minutes || 0) * 60,
                    status: 'Online',
                    photoURL: data.photoURL,
                    status_text: data.status_text,
                    equipped_frame: data.equipped_frame
                };
            });
            setHistoricalLeaderboard(list);
        });

        return () => unsubscribe();
    }, []);

    // 2. Study Room Users (Throttled)
    useEffect(() => {
        if (!joinedRoomId) {
            setStudyUsers([]);
            return;
        }

        const path = joinedRoomId === 'public' ? '/study_room_presence' : `rooms/${joinedRoomId}/presence`;
        const roomRef = ref(db, path);
        let latestData: any = null;
        let lastUpdate = 0;
        let animationFrameId: number;

        const processUpdates = () => {
            const now = Date.now();
            if (now - lastUpdate > 1000 && latestData) {
                const list: StudyUser[] = Object.values(latestData)
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        photoURL: u.photoURL,
                        equipped_frame: u.equipped_frame,
                        total_study_time: Number(u.total_study_time) || 0,
                        status: 'Online'
                    }));
                list.sort((a, b) => b.total_study_time - a.total_study_time);

                setStudyUsers(prev => {
                    if (prev.length !== list.length) return list;
                    const isSame = prev.length === list.length && prev[0]?.username === list[0]?.username && prev[0]?.total_study_time === list[0]?.total_study_time;
                    return isSame ? prev : list;
                });
                lastUpdate = now;
            }
            animationFrameId = requestAnimationFrame(processUpdates);
        };

        const unsubscribe = onValue(roomRef, (snapshot) => {
            latestData = snapshot.val();
        });
        processUpdates();
        return () => {
            unsubscribe();
            cancelAnimationFrame(animationFrameId);
        };
    }, [joinedRoomId]);

    // 3. Community Presence (State Source)
    useEffect(() => {
        const globalRef = query(ref(db, '/community_presence'), limitToLast(100));
        let latestData: any = null;
        let lastUpdate = 0;
        let animationFrameId: number;

        const processUpdates = () => {
            const now = Date.now();
            if (now - lastUpdate > 1000 && latestData) { // 1 second throttle
                // 1. Get raw presence data
                const rawList = Object.values(latestData)
                    .filter((u: any) => u && u.username)
                    .map((u: any) => {
                        // 2. Merge with Firestore Profile Data
                        const profile = firestoreProfiles.get(u.username) || {};
                        return {
                            username: u.username,
                            status: u.status || 'Offline',
                            last_seen: u.last_seen || Date.now(),
                            is_studying: u.is_studying || false,

                            // Merged Fields
                            photoURL: profile.photoURL || u.photoURL || "", // Fallback to RDB if migrated slowly
                            equipped_frame: profile.equipped_frame || u.equipped_frame || "",
                            status_text: profile.status_text || u.status_text || ""
                        };
                    });

                const uniqueMap = new Map<string, CommunityUser>();
                rawList.forEach((user: any) => {
                    const existing = uniqueMap.get(user.username);
                    if (!existing) {
                        uniqueMap.set(user.username, user);
                    } else {
                        const isNewer = user.last_seen > existing.last_seen;
                        const isOnline = user.status === 'Online';
                        if (isOnline || (isNewer && existing.status !== 'Online')) {
                            uniqueMap.set(user.username, user);
                        }
                    }
                });

                const list = Array.from(uniqueMap.values());
                list.sort((a, b) => {
                    if (a.status === 'Online' && b.status !== 'Online') return -1;
                    if (a.status !== 'Online' && b.status === 'Online') return 1;
                    return b.last_seen - a.last_seen;
                });

                setCommunityUsers(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
                    return list;
                });
                lastUpdate = now;
            }
            animationFrameId = requestAnimationFrame(processUpdates);
        };

        const unsubscribe = onValue(globalRef, (snapshot) => {
            latestData = snapshot.val();
        });

        processUpdates();

        return () => {
            unsubscribe();
            cancelAnimationFrame(animationFrameId);
        };
    }, [firestoreProfiles]); // Re-run when profiles update

    const leaderboardUsers = useMemo(() => {
        const map = new Map<string, StudyUser>();

        // 1. Seed with ALL users from Firestore Profiles (Base Roster)
        firestoreProfiles.forEach((data, uid) => {
            if (data.username) {
                map.set(data.username, {
                    username: data.username,
                    total_study_time: 0,
                    status: 'Online', // Status will be overwritten by Community merging if actually online
                    photoURL: data.photoURL,
                    status_text: data.status_text,
                    equipped_frame: data.equipped_frame
                });
            }
        });

        // 2. Merge Today's Stats (Overwrites 0 time with actual time)
        historicalLeaderboard.forEach(user => {
            if (user.username) {
                const existing = map.get(user.username);
                if (existing) {
                    existing.total_study_time = user.total_study_time;
                    // Keep profile data if missing in stats, or update if stats has newer (unlikely for profile info)
                } else {
                    map.set(user.username, user);
                }
            }
        });

        // 3. Merge Live Study Room Data
        studyUsers.forEach(user => {
            if (user.username) {
                const existing = map.get(user.username);
                if (existing) {
                    // Update time if live time is greater (it should be)
                    existing.total_study_time = Math.max(existing.total_study_time, user.total_study_time);
                    existing.status = 'Online';
                } else {
                    map.set(user.username, user);
                }
            }
        });

        // 4. Merge Community Presence (Online Status / Metadata)
        communityUsers.forEach(user => {
            if (user.username && map.has(user.username)) {
                const existing = map.get(user.username)!;
                // Update Metadata
                if (!existing.photoURL && user.photoURL) existing.photoURL = user.photoURL;
                if (!existing.equipped_frame && user.equipped_frame) existing.equipped_frame = user.equipped_frame;
                if (user.status_text) existing.status_text = user.status_text;
            }
        });

        const list = Array.from(map.values()).sort((a, b) => b.total_study_time - a.total_study_time);

        // ADD MOCK TRENDS
        return list.map((u, i) => ({
            ...u,
            trend: (i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'same') as 'up' | 'down' | 'same'
        }));
    }, [historicalLeaderboard, studyUsers, communityUsers, firestoreProfiles]);

    // --- CENTRAL IMAGE/FRAME LOOKUP ---
    const userLookups = useMemo(() => {
        const imageMap = new Map<string, string>();
        const frameMap = new Map<string, string>();

        // 1. Current User (Priority)
        if (username) {
            if (userImage) imageMap.set(username, userImage);
            if (userFrame) frameMap.set(username, userFrame);
        }

        // 2. Data Sources
        [historicalLeaderboard, communityUsers, studyUsers].forEach(list => {
            list.forEach(u => {
                if (u.photoURL) imageMap.set(u.username, u.photoURL);
                if (u.equipped_frame) frameMap.set(u.username, u.equipped_frame);
            });
        });

        return { imageMap, frameMap };
    }, [username, userImage, userFrame, historicalLeaderboard, communityUsers, studyUsers]);

    const getUserImage = useCallback((targetUsername: string) => {
        return userLookups.imageMap.get(targetUsername);
    }, [userLookups]);

    const getUserFrame = useCallback((targetUsername: string) => {
        return userLookups.frameMap.get(targetUsername);
    }, [userLookups]);

    // 5. Initialize/Maintain Study Session
    useEffect(() => {
        if (!joinedRoomId || !username) return;

        let studyRef: any;
        if (joinedRoomId === 'public') {
            studyRef = ref(db, `/study_room_presence/${username}`);
        } else {
            studyRef = ref(db, `rooms/${joinedRoomId}/presence/${username}`);
        }

        const initialSeconds = 0; // Or fetch from somewhere if persisting session

        // Write presence
        set(studyRef, {
            username: username,
            photoURL: userImage || "",
            equipped_frame: userFrame || "",
            total_study_time: initialSeconds,
            status: 'Online'
        });

        // Offline handler
        onDisconnect(studyRef).remove();

        return () => {
            // Cleanup on unmount/leave
            remove(studyRef);
            onDisconnect(studyRef).cancel();
        };
    }, [joinedRoomId, username, userImage, userFrame]);

    // --- TIMER (Writes to Firestore) ---
    useEffect(() => {
        if (!username || !isStudying) return;

        const updateFirestore = async () => {
            const today = new Date().toISOString().split('T')[0];
            const docId = `${today}_${username}`;
            const docRef = doc(firestore, 'daily_stats', docId);

            try {
                // Don't include status_text here to avoid overwriting it with empty string
                await setDoc(docRef, {
                    username,
                    minutes: incrementFirestore(1),
                    date: today,
                    photoURL: userImage || "",
                    last_updated: serverTimestampFirestore(),
                }, { merge: true });
            } catch (e) { console.error("Firestore timer update failed", e); }
        };

        const flushToCloudflare = () => {
            // Keep D1 backup functionality for redundancy
            const minutesToAdd = unsavedMinutesRef.current;
            if (minutesToAdd > 0) {
                unsavedMinutesRef.current = 0;
                api.study.updateTime(username, minutesToAdd)
                    .catch(e => { });
            }
        };

        const interval = setInterval(() => {
            // Legacy Realtime DB update (Required for live StudyGrid UI)
            const myStudyTimeRef = ref(db, `/study_room_presence/${username}/total_study_time`);
            set(myStudyTimeRef, increment(60));

            // Sync to Firestore
            updateFirestore();

            unsavedMinutesRef.current += 1;
            if (unsavedMinutesRef.current >= 1) flushToCloudflare();
        }, 60000);

        return () => {
            clearInterval(interval);
            flushToCloudflare();
        };
    }, [username, isStudying, userImage]);

    const joinSession = useCallback((roomId: string = "public") => {
        setJoinedRoomId(roomId);
        setIsStudying(true);
    }, []);
    const leaveSession = useCallback((specificRoomId?: string) => {
        if (specificRoomId && joinedRoomId !== specificRoomId) return; // Don't leave if we already switched rooms
        setIsStudying(false);
        setJoinedRoomId(null);
    }, [joinedRoomId]);

    const updateStatusMessage = useCallback(async (msg: string) => {
        if (!username) return;

        // 1. Update Realtime DB (Legacy/Community Panel Immediate)
        update(ref(db, `/community_presence/${username}`), { status_text: msg });

        // 2. Update Firestore Profile
        const userRef = doc(firestore, 'users', username);
        setDoc(userRef, { status_text: msg }, { merge: true });

        // 3. Update Daily Stats (for Leaderboard visibility)
        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(firestore, 'daily_stats', `${today}_${username}`);
        setDoc(statsRef, { status_text: msg }, { merge: true });

        // 4. D1 Backup
        api.auth.updateStatus(username, msg);

        toast({ title: "Status Updated" });
    }, [username, toast]);



    const isMod = useCallback((u: string) => userRoles[u] === 'mod', [userRoles]);

    const value = useMemo(() => ({
        username, userImage, setUsername, setUserImage,
        studyUsers, leaderboardUsers, communityUsers,
        isStudying, joinSession, leaveSession, updateStatusMessage,
        getUserImage, getUserFrame,
        userRoles, isMod, joinedRoomId
    }), [username, userImage, setUsername, setUserImage, studyUsers, leaderboardUsers, communityUsers, isStudying, joinSession, leaveSession, updateStatusMessage, getUserImage, getUserFrame, userRoles, isMod, joinedRoomId]);

    return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};