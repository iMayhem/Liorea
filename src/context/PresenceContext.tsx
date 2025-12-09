"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

export interface OnlineUser {
  username: string;
  status: 'Online' | 'Offline';
  total_study_time: number; // in seconds
  status_text?: string; 
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
  
  // Track minutes locally to batch updates (Front: 1min, Back: 5min)
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
        if (username) {
            const userStatusRef = ref(db, `/status/${username}`);
            set(userStatusRef, null); 
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. REALTIME PRESENCE
  useEffect(() => {
    if (!username) return;

    const userStatusRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, (snap) => {
        if (snap.val() === true) {
            update(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
            });
            onDisconnect(userStatusRef).remove();
        }
    });

    return () => unsubscribe();
  }, [username]);


  // 3. STUDY TIMER LOGIC (Batched)
  useEffect(() => {
    if (!username || !isStudying) return;

    // Helper to send pending minutes to server
    const flushMinutes = () => {
        const amount = unsavedMinutesRef.current;
        if (amount > 0) {
            const timerRef = ref(db, `/timers/${username}/total_minutes`);
            set(timerRef, increment(amount)); // Send batch
            unsavedMinutesRef.current = 0;    // Reset local buffer
        }
    };

    update(ref(db, `/status/${username}`), { is_studying: true });

    // Run every 60 seconds
    const interval = setInterval(() => {
        // 1. Increment local buffer
        unsavedMinutesRef.current += 1;

        // 2. Update UI Immediately (Optimistic)
        setOnlineUsers(prev => {
            const updated = prev.map(user => {
                if (user.username === username) {
                    return { ...user, total_study_time: user.total_study_time + 60 };
                }
                return user;
            });
            // Re-sort to keep leaderboard jumping live
            return updated.sort((a, b) => b.total_study_time - a.total_study_time);
        });

        // 3. Check if it's time to sync with Backend (Every 5 mins)
        if (unsavedMinutesRef.current >= 5) {
            flushMinutes();
        }

    }, 60000);

    // Safety: Flush on tab close
    const handleBeforeUnload = () => {
        flushMinutes();
        update(ref(db, `/status/${username}`), { is_studying: false });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Flush remaining time on unmount/stop
        flushMinutes();
        
        if (username) {
             update(ref(db, `/status/${username}`), { is_studying: false });
        }
    };
  }, [username, isStudying]);


  // 4. FETCH LEADERBOARD (Realtime Listener)
  useEffect(() => {
    const statusRef = ref(db, '/status');
    const timersRef = ref(db, '/timers');

    const unsub = onValue(statusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        
        onValue(timersRef, (timerSnap) => {
            const timerData = timerSnap.val() || {};
            
            const usersList: OnlineUser[] = Object.keys(statusData).map((key) => {
                let minutes = timerData[key]?.total_minutes || 0;
                
                // CRITICAL: If this is ME, add the unsaved local buffer
                // This ensures the server data doesn't "overwrite" my local progress visually
                if (key === username) {
                    minutes += unsavedMinutesRef.current;
                }

                return {
                    username: key,
                    status: 'Online',
                    total_study_time: minutes * 60, 
                    status_text: statusData[key].status_text || ""
                };
            });

            usersList.sort((a, b) => b.total_study_time - a.total_study_time);
            setOnlineUsers(usersList);
        }, { onlyOnce: true });
    });

    return () => unsub();
  }, [username]); // Depend on username so we know who "ME" is


  // --- ACTIONS ---

  const joinSession = useCallback(() => setIsStudying(true), []);
  const leaveSession = useCallback(() => setIsStudying(false), []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    const statusRef = ref(db, `/status/${username}`);
    await update(statusRef, { status_text: msg });
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