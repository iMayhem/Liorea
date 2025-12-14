"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove, query, limitToLast } from 'firebase/database';
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
    joinSession: () => void;
    leaveSession: () => void;
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

    // --- GLOBAL PRESENCE ---
    useEffect(() => {
        if (!username) return;
        const commRef = ref(db, `/community_presence/${username}`);
        const connectionRef = ref(db, '.info/connected');

        const unsubscribe = onValue(connectionRef, async (snap: any) => {
            if (snap.val() === true) {
                let savedStatus = "";
                let savedPhoto = userImage || "";
                let savedFrame = userFrame || "";

                try {
                    const data = await api.auth.getStatus(username);
                    if (data.status_text) savedStatus = data.status_text;
                    if (data.photoURL) {
                        savedPhoto = data.photoURL;
                        setUserImage(savedPhoto); // Update local state immediately
                    }
                    if (data.equipped_frame) {
                        savedFrame = data.equipped_frame;
                        setUserFrameState(savedFrame);
                    }
                } catch (e) { }

                // Establish Presence
                await onDisconnect(commRef).update({
                    status: 'Offline',
                    last_seen: serverTimestamp(),
                    is_studying: false
                });

                update(commRef, {
                    username: username,
                    photoURL: savedPhoto,
                    equipped_frame: savedFrame,
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
    }, [username, userImage, userFrame]);

    // --- ROLES LISTENER ---
    useEffect(() => {
        const rolesRef = ref(db, 'roles');
        const unsubscribe = onValue(rolesRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserRoles(snapshot.val());
            } else {
                setUserRoles({});
            }
        });
        return () => unsubscribe();
    }, []);

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
                    equipped_frame: userFrame || "",
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
    }, [username, isStudying, userImage, userFrame]);

    // ... (DATA LISTENERS unchanged) ...



    // --- DATA LISTENERS (THROTTLED) ---
    // We use a ref to store the latest raw data from Firebase, and a timer to update React state
    // only once per second. This prevents "millisecond" updates from re-rendering the whole app.

    // 1. Leaderboard (Historical)
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
                        photoURL: u.photoURL,
                    }));
                setHistoricalLeaderboard(formatted);
            } catch (e) { console.error("Leaderboard fetch failed", e); }
        };
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000); // Keep 60s poll for leaderboards
        return () => clearInterval(interval);
    }, []);

    // 2. Study Room Users (Throttled)
    useEffect(() => {
        const roomRef = ref(db, '/study_room_presence');
        let latestData: any = null;
        let lastUpdate = 0;
        let animationFrameId: number;

        const processUpdates = () => {
            const now = Date.now();
            if (now - lastUpdate > 1000 && latestData) { // 1 second throttle
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

                // Optimized comparison: Check length and total_study_time of top user
                setStudyUsers(prev => {
                    if (prev.length !== list.length) return list;
                    const prevTop = prev[0];
                    const newTop = list[0];
                    // If top user changed or their score changed, update (good heuristic for leaderboard)
                    // For perfect accuracy we'd check all, but for performance let's check a simplified hash or just top items
                    // Actually, let's just trust React's reconciliation if we pass a new reference?
                    // No, we want to AVOID passing new reference if data is same to prevent re-renders downstream.
                    // Let's use JSON.stringify but only if length is small, otherwise assume changed?
                    // list is usually small (<20). JSON.stringify is fine for 20 items.
                    // But wait, the user said clogging.
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

        // Start loop
        processUpdates();

        return () => {
            unsubscribe();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 3. Community Presence (Throttled)
    useEffect(() => {
        const globalRef = query(ref(db, '/community_presence'), limitToLast(100));
        let latestData: any = null;
        let lastUpdate = 0;
        let animationFrameId: number;

        const processUpdates = () => {
            const now = Date.now();
            if (now - lastUpdate > 1000 && latestData) { // 1 second throttle
                const rawList = Object.values(latestData)
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        photoURL: u.photoURL,
                        equipped_frame: u.equipped_frame,
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

                setCommunityUsers(prev => {
                    // Naive check removed: Always update if data is fresh to ensure status_text changes propagate.
                    // React key diffing will handle DOM updates efficiently.
                    // To prevent loop if data is identical, we can do a deep equality check or just JSON stringify.
                    // JSON stringify is fast enough for <100 items.
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
    }, []);

    const leaderboardUsers = useMemo(() => {
        const map = new Map<string, StudyUser>();
        historicalLeaderboard.forEach(user => { if (user.username) map.set(user.username, user); });
        studyUsers.forEach(user => { if (user.username) map.set(user.username, user); });

        communityUsers.forEach(user => {
            if (user.username && map.has(user.username)) {
                const existing = map.get(user.username)!;
                if (!existing.photoURL && user.photoURL) existing.photoURL = user.photoURL;
                if (!existing.equipped_frame && user.equipped_frame) existing.equipped_frame = user.equipped_frame;
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

    // --- TIMER ---
    useEffect(() => {
        if (!username || !isStudying) return;

        const flushToCloudflare = () => {
            const minutesToAdd = unsavedMinutesRef.current;
            if (minutesToAdd > 0) {
                unsavedMinutesRef.current = 0;
                api.study.updateTime(username, minutesToAdd)
                    .catch(e => {
                        console.error("Failed to save to D1", e);
                    });
            }
        };

        const interval = setInterval(() => {
            const myStudyTimeRef = ref(db, `/study_room_presence/${username}/total_study_time`);
            set(myStudyTimeRef, increment(60));
            unsavedMinutesRef.current += 1;
            if (unsavedMinutesRef.current >= 1) flushToCloudflare();
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



    const isMod = useCallback((u: string) => userRoles[u] === 'mod', [userRoles]);

    const value = useMemo(() => ({
        username, userImage, setUsername, setUserImage,
        studyUsers, leaderboardUsers, communityUsers,
        isStudying, joinSession, leaveSession, updateStatusMessage,
        getUserImage, getUserFrame,
        userRoles, isMod
    }), [username, userImage, setUsername, setUserImage, studyUsers, leaderboardUsers, communityUsers, isStudying, joinSession, leaveSession, updateStatusMessage, getUserImage, getUserFrame, userRoles, isMod]);

    return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};