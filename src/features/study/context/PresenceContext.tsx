"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

import { api } from '@/lib/api';

export interface StudyUser {
    username: string;
    total_study_time: number;
    status: 'Online';
    photoURL?: string;
    status_text?: string;
    trend?: 'up' | 'down' | 'same';
}

export interface CommunityUser {
    username: string;
    status: 'Online' | 'Offline';
    last_seen: number;
    status_text?: string;
    is_studying: boolean;
    photoURL?: string;
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
    joinSession: () => void;
    leaveSession: () => void;
    updateStatusMessage: (msg: string) => Promise<void>;
    getUserImage: (username: string) => string | undefined;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsernameState] = useState<string | null>(null);
    const [userImage, setUserImageState] = useState<string | null>(null);

    const setUserImage = useCallback((url: string | null) => {
        setUserImageState(url);
        if (url) localStorage.setItem('liorea-user-image', url);
        else localStorage.removeItem('liorea-user-image');
    }, []);

    const [studyUsers, setStudyUsers] = useState<StudyUser[]>([]);
    const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
    const [historicalLeaderboard, setHistoricalLeaderboard] = useState<StudyUser[]>([]);

    const [isStudying, setIsStudying] = useState(false);
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
            setIsStudying(false);
        }
    }, [username]);

    // --- GLOBAL PRESENCE ---
    useEffect(() => {
        if (!username) return;
        const commRef = ref(db, `/community_presence/${username}`);
        const connectionRef = ref(db, '.info/connected');

        const unsubscribe = onValue(connectionRef, async (snap: any) => {
            if (snap.val() === true) {
                let savedStatus = "";
                try {
                    const data = await api.auth.getStatus(username);
                    if (data.status_text) savedStatus = data.status_text;
                } catch (e) { }

                // Establish Presence
                await onDisconnect(commRef).update({
                    status: 'Offline',
                    last_seen: serverTimestamp(),
                    is_studying: false
                });

                update(commRef, {
                    username: username,
                    photoURL: userImage || "",
                    status: 'Online',
                    last_seen: serverTimestamp(),
                    status_text: savedStatus,
                });
            }
        });

        return () => {
            unsubscribe();
            onDisconnect(commRef).cancel(); // CRITICAL: Cancel onDisconnect when username changes/unmounts
        };
    }, [username, userImage]);

    // --- ACTIVE STUDY LOGIC ---
    useEffect(() => {
        if (!username) return;

        const studyRef = ref(db, `/study_room_presence/${username}`);
        const commRef = ref(db, `/community_presence/${username}`);

        const initializeStudySession = async () => {
            if (isStudying) {
                let initialSeconds = 0;
                try {
                    const data = await api.study.getStats(username);
                    if (data.total_minutes) {
                        initialSeconds = data.total_minutes * 60;
                    }
                } catch (e) { }

                await onDisconnect(studyRef).remove(); // Ensure remove is queued first

                set(studyRef, {
                    username: username,
                    photoURL: userImage || "",
                    total_study_time: initialSeconds,
                    status: 'Online'
                });

                update(commRef, { is_studying: true });
            } else {
                onDisconnect(studyRef).cancel(); // Clean up
                remove(studyRef);
                update(commRef, { is_studying: false });
            }
        };

        initializeStudySession();

        return () => {
            // Basic Cleanup
            if (!isStudying && username) {
                remove(studyRef);
                update(commRef, { is_studying: false }).catch(() => { });
            }
        };
    }, [username, isStudying, userImage]);

    // ... (DATA LISTENERS unchanged) ...



    // --- DATA LISTENERS ---
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await api.study.getLeaderboard();
                const formatted: StudyUser[] = data
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        total_study_time: (u.total_minutes || 0) * 60,
                        status: 'Online',
                        photoURL: u.photoURL
                    }));
                setHistoricalLeaderboard(formatted);
            } catch (e) { console.error("Leaderboard fetch failed", e); }
        };
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const roomRef = ref(db, '/study_room_presence');
        return onValue(roomRef, (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                const list: StudyUser[] = Object.values(data)
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        photoURL: u.photoURL,
                        total_study_time: Number(u.total_study_time) || 0,
                        status: 'Online'
                    }));
                list.sort((a, b) => b.total_study_time - a.total_study_time);
                setStudyUsers(list);
            } else { setStudyUsers([]); }
        });
    }, []);

    useEffect(() => {
        const globalRef = ref(db, '/community_presence');
        return onValue(globalRef, (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                const rawList = Object.values(data)
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        photoURL: u.photoURL,
                        status: u.status || 'Offline',
                        last_seen: u.last_seen || Date.now(),
                        status_text: u.status_text || "",
                        is_studying: u.is_studying || false
                    }));

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
                setCommunityUsers(list);
            } else { setCommunityUsers([]); }
        });
    }, []);

    const leaderboardUsers = useMemo(() => {
        const map = new Map<string, StudyUser>();
        historicalLeaderboard.forEach(user => { if (user.username) map.set(user.username, user); });
        studyUsers.forEach(user => { if (user.username) map.set(user.username, user); });

        communityUsers.forEach(user => {
            if (user.username && map.has(user.username)) {
                const existing = map.get(user.username)!;
                if (!existing.photoURL && user.photoURL) existing.photoURL = user.photoURL;
                // MERGE STATUS TEXT
                if (user.status_text) existing.status_text = user.status_text;
            }
        });

        const list = Array.from(map.values()).sort((a, b) => b.total_study_time - a.total_study_time);

        // ADD MOCK TRENDS
        return list.map((u, i) => ({
            ...u,
            trend: (i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'same') as 'up' | 'down' | 'same'
        }));
    }, [historicalLeaderboard, studyUsers, communityUsers]);

    // --- CENTRAL IMAGE LOOKUP ---
    const userImageMap = useMemo(() => {
        const map = new Map<string, string>();

        // 1. Current User (Priority)
        if (username && userImage) map.set(username, userImage);

        // 2. Data Sources
        historicalLeaderboard.forEach(u => { if (u.photoURL) map.set(u.username, u.photoURL); });
        communityUsers.forEach(u => { if (u.photoURL) map.set(u.username, u.photoURL); });
        studyUsers.forEach(u => { if (u.photoURL) map.set(u.username, u.photoURL); });

        return map;
    }, [username, userImage, historicalLeaderboard, communityUsers, studyUsers]);

    const getUserImage = useCallback((targetUsername: string) => {
        return userImageMap.get(targetUsername);
    }, [userImageMap]);

    // --- TIMER ---
    useEffect(() => {
        if (!username || !isStudying) return;

        const flushToCloudflare = () => {
            const minutesToAdd = unsavedMinutesRef.current;
            if (minutesToAdd > 0) {
                unsavedMinutesRef.current = 0;
                api.study.updateTime(username, minutesToAdd)
                    .catch(e => console.error("Failed to save to D1", e));
            }
        };

        const interval = setInterval(() => {
            const myStudyTimeRef = ref(db, `/study_room_presence/${username}/total_study_time`);
            set(myStudyTimeRef, increment(60));
            unsavedMinutesRef.current += 1;
            if (unsavedMinutesRef.current >= 5) flushToCloudflare();
        }, 60000);

        return () => {
            clearInterval(interval);
            flushToCloudflare();
        };
    }, [username, isStudying]);

    const joinSession = useCallback(() => setIsStudying(true), []);
    const leaveSession = useCallback(() => setIsStudying(false), []);

    const updateStatusMessage = useCallback(async (msg: string) => {
        if (!username) return;
        update(ref(db, `/community_presence/${username}`), { status_text: msg });
        api.auth.updateStatus(username, msg);
        toast({ title: "Status Updated" });
    }, [username, toast]);



    const value = useMemo(() => ({
        username, userImage, setUsername, setUserImage,
        studyUsers, leaderboardUsers, communityUsers,
        isStudying, joinSession, leaveSession, updateStatusMessage,
        getUserImage
    }), [username, userImage, setUsername, setUserImage, studyUsers, leaderboardUsers, communityUsers, isStudying, joinSession, leaveSession, updateStatusMessage, getUserImage]);

    return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};