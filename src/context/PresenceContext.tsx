"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface StudyUser {
  username: string;
  total_study_time: number; // In Seconds
  status: 'Online';
  photoURL?: string;
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
  
  studyUsers: StudyUser[];
  communityUsers: CommunityUser[];
  leaderboardUsers: StudyUser[];
  
  isStudying: boolean;
  joinSession: () => void;
  leaveSession: () => void;
  updateStatusMessage: (msg: string) => Promise<void>;
  renameUser: (newName: string) => Promise<boolean>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  const [studyUsers, setStudyUsers] = useState<StudyUser[]>([]);
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
  const [historicalLeaderboard, setHistoricalLeaderboard] = useState<StudyUser[]>([]);
  
  const [isStudying, setIsStudying] = useState(false);
  const unsavedMinutesRef = useRef(0);
  const { toast } = useToast();

  // 1. INITIALIZATION
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    const storedImage = localStorage.getItem('liorea-user-image');
    if (storedUser) setUsernameState(storedUser);
    if (storedImage) setUserImage(storedImage);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        localStorage.setItem('liorea-username', name);
    } else {
        // Logout Logic
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

  // --- 2. GLOBAL COMMUNITY PRESENCE (Sidebar) ---
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
                photoURL: userImage || "",
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
  }, [username, userImage]);

  // --- 3. ACTIVE STUDY LOGIC ---
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
                photoURL: userImage || "",
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
  }, [username, isStudying, userImage]);


  // --- 4. DATA LISTENERS ---

  // A. FETCH LEADERBOARD (D1)
  useEffect(() => {
     const fetchLeaderboard = async () => {
         try {
             const res = await fetch(`${WORKER_URL}/leaderboard`);
             if (res.ok) {
                 const data = await res.json();
                 // FILTER: Block bad data
                 const formatted: StudyUser[] = data
                    .filter((u: any) => u && u.username)
                    .map((u: any) => ({
                        username: u.username,
                        total_study_time: (u.total_minutes || 0) * 60,
                        status: 'Online'
                    }));
                 setHistoricalLeaderboard(formatted);
             }
         } catch (e) {
             console.error("Leaderboard fetch failed", e);
         }
     };

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
            const list: StudyUser[] = Object.values(data)
                // FILTER: Block bad data
                .filter((u: any) => u && u.username)
                .map((u: any) => ({
                    username: u.username,
                    photoURL: u.photoURL,
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

  // C. LISTEN TO COMMUNITY (With Deduplication)
  useEffect(() => {
    const globalRef = ref(db, '/community_presence');
    return onValue(globalRef, (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const rawList = Object.values(data)
                // FILTER: Block bad data
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
        } else {
            setCommunityUsers([]);
        }
    });
  }, []);

  // D. MERGE LEADERBOARD
  const leaderboardUsers = useMemo(() => {
      const map = new Map<string, StudyUser>();
      historicalLeaderboard.forEach(user => { if(user.username) map.set(user.username, user); });
      studyUsers.forEach(user => { if(user.username) map.set(user.username, user); });
      
      communityUsers.forEach(user => {
          if (user.username && map.has(user.username)) {
              const existing = map.get(user.username)!;
              if (!existing.photoURL && user.photoURL) {
                  existing.photoURL = user.photoURL;
              }
          }
      });

      return Array.from(map.values()).sort((a, b) => b.total_study_time - a.total_study_time);
  }, [historicalLeaderboard, studyUsers, communityUsers]);


  // --- 5. TIMER & SAVE LOGIC (FIXED) ---
  useEffect(() => {
    if (!username || !isStudying) return;

    const flushToCloudflare = () => {
        const minutesToAdd = unsavedMinutesRef.current;
        if (minutesToAdd > 0) {
            // FIX: Reset immediately to prevent accumulation bug
            unsavedMinutesRef.current = 0;
            
            fetch(`${WORKER_URL}/study/update`, {
                method: "POST",
                body: JSON.stringify({ username, minutes: minutesToAdd }), 
                headers: { "Content-Type": "application/json" }
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
      if (!username) return false;
      const oldName = username;

      try {
          // Tell Cloudflare to move history
          await fetch(`${WORKER_URL}/user/rename`, {
              method: 'POST',
              body: JSON.stringify({ oldUsername: oldName, newUsername: newName }),
              headers: { 'Content-Type': 'application/json' }
          });

          // Cleanup Firebase
          await remove(ref(db, `/community_presence/${oldName}`));
          if (isStudying) {
              await remove(ref(db, `/study_room_presence/${oldName}`));
          }

          setUsername(newName);
          return true;

      } catch (e) {
          console.error("Rename failed", e);
          toast({ variant: "destructive", title: "Rename failed", description: "Could not update server." });
          return false;
      }
  }, [username, isStudying, setUsername, toast]);

  const value = useMemo(() => ({
    username, userImage, setUsername,
    studyUsers, leaderboardUsers, communityUsers, 
    isStudying, joinSession, leaveSession, updateStatusMessage, renameUser
  }), [username, userImage, setUsername, studyUsers, leaderboardUsers, communityUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};