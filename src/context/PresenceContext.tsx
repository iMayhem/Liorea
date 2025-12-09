"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
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
  const { toast } = useToast();
  
  // 1. Initialize User from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        localStorage.setItem('liorea-username', name);
    } else {
        // Logout Cleanup
        if (username) {
            const userStatusRef = ref(db, `/status/${username}`);
            set(userStatusRef, null); // Remove from Firebase
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. REALTIME PRESENCE (Online Status)
  useEffect(() => {
    if (!username) return;

    const userStatusRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, (snap) => {
        if (snap.val() === true) {
            // We are connected. Set status to Online.
            update(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
            });

            // MAGIC LINE: If internet dies or tab closes, delete this node on server.
            onDisconnect(userStatusRef).remove();
        }
    });

    return () => {
        unsubscribe();
        // If unmounting but not closing (e.g. logging out), remove manually
        // set(userStatusRef, null); 
    };
  }, [username]);


  // 3. STUDY TIMER LOGIC
  useEffect(() => {
    if (!username || !isStudying) return;

    // Update status to show "Studying"
    update(ref(db, `/status/${username}`), { is_studying: true });

    // Loop: Add 1 minute every 60 seconds
    const interval = setInterval(() => {
        const timerRef = ref(db, `/timers/${username}/total_minutes`);
        // Atomic increment (safe against lag)
        set(timerRef, increment(1));
    }, 60000);

    return () => {
        clearInterval(interval);
        // When stopping study, update status
        if (username) {
             update(ref(db, `/status/${username}`), { is_studying: false });
        }
    };
  }, [username, isStudying]);


  // 4. FETCH LEADERBOARD & USERS (Realtime Listener)
  useEffect(() => {
    const statusRef = ref(db, '/status');
    const timersRef = ref(db, '/timers');

    // Listen for changes
    const unsub = onValue(statusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        
        // Fetch timers once to combine data
        onValue(timersRef, (timerSnap) => {
            const timerData = timerSnap.val() || {};
            
            const usersList: OnlineUser[] = Object.keys(statusData).map((key) => {
                const minutes = timerData[key]?.total_minutes || 0;
                return {
                    username: key,
                    status: 'Online',
                    total_study_time: minutes * 60, // Convert to seconds for UI
                    status_text: statusData[key].status_text || ""
                };
            });

            // Sort by Study Time (Highest first)
            usersList.sort((a, b) => b.total_study_time - a.total_study_time);
            
            setOnlineUsers(usersList);
        }, { onlyOnce: true });
    });

    return () => unsub();
  }, []);


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
      // In NoSQL without auth, we just switch the local name.
      // (Old data stays under old name, new data under new name)
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