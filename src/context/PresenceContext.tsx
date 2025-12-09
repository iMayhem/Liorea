"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

// Type 1: People in the Study Room (Active Timer)
export interface StudyUser {
  username: string;
  total_study_time: number; // In Seconds
  status: 'Online';
}

// Type 2: People in the Community (Sidebar)
export interface CommunityUser {
  username: string;
  status: 'Online' | 'Offline';
  last_seen: number;
  status_text?: string;
  is_studying: boolean; 
}

interface PresenceContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  
  studyUsers: StudyUser[];        // Only people currently studying
  communityUsers: CommunityUser[]; // Everyone who visited
  leaderboardUsers: StudyUser[];   // All-time top performers (Active + Offline)
  
  isStudying: boolean;
  joinSession: () => void;
  leaveSession: () => void;
  updateStatusMessage: (msg: string) => Promise<void>;
  renameUser: (newName: string) => Promise<boolean>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  
  const [studyUsers, setStudyUsers] = useState<StudyUser[]>([]);
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
  // Raw data from D1
  const [historicalLeaderboard, setHistoricalLeaderboard] = useState<StudyUser[]>([]);
  
  const [isStudying, setIsStudying] = useState(false);
  const unsavedMinutesRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
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
        setIsStudying(false);
    }
  }, [username]);

  // --- 1. GLOBAL COMMUNITY PRESENCE ---
  useEffect(() => {
    if (!username) return;
    const commRef = ref(db, `/community_presence/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap: any) => {
        if (snap.val() === true) {
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) {}

            update(commRef, {
                username: username,
                status: 'Online',
                last_seen: serverTimestamp(),
                status_text: savedStatus,
            });

            onDisconnect(commRef).update({
                status: 'Offline',
                last_seen: serverTimestamp(),
                is_studying: false 
            });
        }
    });
    return () => unsubscribe();
  }, [username]);

  // --- 2. ACTIVE STUDY LOGIC ---
  useEffect(() => {
    if (!username) return;

    const studyRef = ref(db, `/study_room_presence/${username}`);
    const commRef = ref(db, `/community_presence/${username}`);

    const initializeStudySession = async () => {
        if (isStudying) {
            let initialSeconds = 0;
            try {
                const res = await fetch(`${WORKER_URL}/study/stats?username=${username}`);
                const data = await res.json();
                if (data.total_minutes) {
                    initialSeconds = data.total_minutes * 60; 
                }
            } catch (e) {}

            set(studyRef, {
                username: username,
                total_study_time: initialSeconds,
                status: 'Online'
            });
            
            update(commRef, { is_studying: true });
            onDisconnect(studyRef).remove();
        } else {
            remove(studyRef);
            update(commRef, { is_studying: false });
        }
    };

    initializeStudySession();

    return () => {
        if (!isStudying && username) {
             remove(studyRef);
             update(commRef, { is_studying: false }).catch(() => {});
        }
    };
  }, [username, isStudying]);

  // --- 3. DATA LISTENERS ---
  
  // A. FETCH PERMANENT LEADERBOARD (From D1)
  useEffect(() => {
     const fetchLeaderboard = async () => {
         try {
             const res = await fetch(`${WORKER_URL}/leaderboard`);
             if (res.ok) {
                 const data = await res.json();
                 // Convert minutes (D1) to seconds (UI standard)
                 const formatted: StudyUser[] = data.map((u: any) => ({
                     username: u.username,
                     total_study_time: (u.total_minutes || 0) * 60,
                     status: 'Online' // Just for type compatibility
                 }));
                 setHistoricalLeaderboard(formatted);
             }
         } catch (e) {
             console.error("Leaderboard fetch failed", e);
         }
     };

     // Fetch on mount and every 60 seconds to keep fresh
     fetchLeaderboard();
     const interval = setInterval(fetchLeaderboard, 60000);
     return () => clearInterval(interval);
  }, []);

  // B. LISTEN TO LIVE STUDY ROOM
  useEffect(() => {
    const roomRef = ref(db, '/study_room_presence');
    return onValue(roomRef, (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const list: StudyUser[] = Object.values(data).map((u: any) => ({
                username: u.username,
                total_study_time: Number(u.total_study_time) || 0, 
                status: 'Online'
            }));
            list.sort((a, b) => b.total_study_time - a.total_study_time);
            setStudyUsers(list);
        } else {
            setStudyUsers([]);
        }
    });
  }, []);

  // C. LISTEN TO COMMUNITY
  useEffect(() => {
    const globalRef = ref(db, '/community_presence');
    return onValue(globalRef, (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const list: CommunityUser[] = Object.values(data).map((u: any) => ({
                username: u.username,
                status: u.status || 'Offline',
                last_seen: u.last_seen || Date.now(),
                status_text: u.status_text || "",
                is_studying: u.is_studying || false
            }));
            
            list.sort((a, b) => {
                if (a.status === 'Online' && b.status !== 'Online') return -1;
                if (a.status !== 'Online' && b.status === 'Online') return 1;
                return b.last_seen - a.last_seen;
            });
            setCommunityUsers(list);
        } else {
            setCommunityUsers([]);
        }
    });
  }, []);

  // --- 4. MERGE LEADERBOARD (Historical + Live) ---
  const leaderboardUsers = useMemo(() => {
      // 1. Create a Map of the historical data
      const map = new Map<string, StudyUser>();
      
      historicalLeaderboard.forEach(user => {
          map.set(user.username, user);
      });

      // 2. Override with Live Data (because it's more accurate/recent)
      studyUsers.forEach(user => {
          map.set(user.username, user);
      });

      // 3. Convert back to array and sort
      return Array.from(map.values()).sort((a, b) => b.total_study_time - a.total_study_time);
  }, [historicalLeaderboard, studyUsers]);


  // --- 5. TIMER & SAVE LOGIC ---
  useEffect(() => {
    if (!username || !isStudying) return;

    const flushToCloudflare = () => {
        const minutesToAdd = unsavedMinutesRef.current;
        if (minutesToAdd > 0) {
            fetch(`${WORKER_URL}/study/update`, {
                method: "POST",
                body: JSON.stringify({ username, minutes: minutesToAdd }), 
                headers: { "Content-Type": "application/json" }
            }).then(res => {
                if (res.ok) unsavedMinutesRef.current = 0;
            }).catch(e => console.error("Failed to save to D1", e));
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
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    });
    toast({ title: "Status Updated" });
  }, [username, toast]);

  const renameUser = useCallback(async (newName: string) => {
      setUsername(newName);
      return true;
  }, [setUsername]);

  const value = useMemo(() => ({
    username, setUsername, 
    studyUsers,        // For Grid (Only Active)
    leaderboardUsers,  // For Trophy (Active + Offline)
    communityUsers,    // For Sidebar
    isStudying, joinSession, leaveSession, updateStatusMessage, renameUser
  }), [username, setUsername, studyUsers, communityUsers, leaderboardUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};