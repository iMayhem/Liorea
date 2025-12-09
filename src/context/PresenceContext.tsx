"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  status: 'Online' | 'Offline';
  total_study_time: number; // in seconds
  status_text?: string; 
  is_studying?: boolean;
}

interface PresenceContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  onlineUsers: OnlineUser[];
  isStudying: boolean;
  joinSession: () => void;
  leaveSession: () => void;
  updateStatusMessage: (msg: string) => Promise<void>;
  renameUser: (newName: string) => Promise<boolean>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  
  const unsavedMinutesRef = useRef(0);
  const { toast } = useToast();
  
  // 1. Initialize User
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        localStorage.setItem('liorea-username', name);
    } else {
        // Logout: Clear everything
        if (username) {
            remove(ref(db, `/status/${username}`));
            remove(ref(db, `/study_room/${username}`));
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // ============================================================
  // 2. GLOBAL PRESENCE (Home Page List)
  // ============================================================
  useEffect(() => {
    if (!username) return;

    const globalRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // A. Fetch persistent status (Cloudflare)
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) { console.error(e); }

            // B. Set Online Globally
            update(globalRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
                status_text: savedStatus
            });

            // C. Instant Disconnect for Global List
            onDisconnect(globalRef).remove();
        }
    });

    return () => unsubscribe();
  }, [username]);


  // ============================================================
  // 3. STUDY ROOM LOGIC (Separate Node)
  // ============================================================
  useEffect(() => {
    if (!username) return;

    const studyRoomRef = ref(db, `/study_room/${username}`);

    if (isStudying) {
        // A. Add to Study Room Node
        update(studyRoomRef, {
            username: username,
            joined_at: serverTimestamp(),
            is_studying: true
        });

        // B. Instant Disconnect for Study Room
        // If tab closes, this node deletes instantly => Timer stops, User leaves grid.
        onDisconnect(studyRoomRef).remove();

        // C. Timer Loop
        const flushToCloudflare = () => {
            const amount = unsavedMinutesRef.current;
            if (amount > 0) {
                fetch(`${WORKER_URL}/study/update`, {
                    method: "POST",
                    body: JSON.stringify({ username }),
                    headers: { "Content-Type": "application/json" }
                }).catch(()=>{});
                unsavedMinutesRef.current = 0;
            }
        };

        const interval = setInterval(() => {
            // Update Timer in Study Room Node (Live Leaderboard)
            set(ref(db, `/study_room/${username}/session_minutes`), increment(1));
            // Update Global Timer (Lifetime stats)
            set(ref(db, `/timers/${username}/total_minutes`), increment(1));

            unsavedMinutesRef.current += 1;
            if (unsavedMinutesRef.current >= 5) flushToCloudflare();
        }, 60000);

        return () => {
            clearInterval(interval);
            flushToCloudflare();
            // We do NOT remove the node here on unmount, 
            // only on explicit leaveSession call or disconnect.
        };
    } else {
        // If isStudying is false, ensure node is gone
        remove(studyRoomRef);
    }
  }, [username, isStudying]);


  // ============================================================
  // 4. DATA LISTENER (Merge Global + Study Data)
  // ============================================================
  useEffect(() => {
    const globalStatusRef = ref(db, '/status');
    const studyRoomRef = ref(db, '/study_room');
    const globalTimersRef = ref(db, '/timers');

    // Listen to Global Status (Base List)
    const unsub = onValue(globalStatusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        
        // Listen to Study Room (Who is actually studying)
        onValue(studyRoomRef, (studySnap) => {
            const studyData = studySnap.val() || {};

            // Listen to Timers (Total times)
            onValue(globalTimersRef, (timerSnap) => {
                const timerData = timerSnap.val() || {};

                // Merge Data
                const mergedList: OnlineUser[] = Object.keys(statusData).map((key) => {
                    const isUserStudying = !!studyData[key];
                    const minutes = timerData[key]?.total_minutes || 0;

                    return {
                        username: key,
                        status: 'Online',
                        total_study_time: minutes * 60, // Total lifetime seconds
                        status_text: statusData[key].status_text || "",
                        is_studying: isUserStudying
                    };
                });

                // Sort: Studying first, then by time
                mergedList.sort((a, b) => {
                    if (a.is_studying && !b.is_studying) return -1;
                    if (!a.is_studying && b.is_studying) return 1;
                    return b.total_study_time - a.total_study_time;
                });

                setOnlineUsers(mergedList);

            }, { onlyOnce: true });
        }, { onlyOnce: true });
    });

    return () => unsub();
  }, []);


  // ============================================================
  // ACTIONS
  // ============================================================

  const joinSession = useCallback(() => setIsStudying(true), []);
  
  const leaveSession = useCallback(() => {
      setIsStudying(false);
      // Logic in Effect 3 handles the node removal
  }, []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    
    // Update Global Node
    update(ref(db, `/status/${username}`), { status_text: msg });

    // Sync to Cloudflare
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("DB Save Failed", e));

    toast({ title: "Status Updated" });
  }, [username, toast]);

  const renameUser = useCallback(async (newName: string) => {
      setUsername(newName);
      return true;
  }, [setUsername]);

  const value = useMemo(() => ({
    username, setUsername, onlineUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser
  }), [username, setUsername, onlineUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};
