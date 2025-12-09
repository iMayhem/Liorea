"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  status: 'Online' | 'Offline';
  total_study_time: number; 
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
  const unsavedMinutesRef = useRef(0);
  const { toast } = useToast();
  
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) localStorage.setItem('liorea-username', name);
    else {
        if (username) set(ref(db, `/status/${username}`), null);
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 1. REALTIME PRESENCE + SYNC SAVED STATUS
  useEffect(() => {
    if (!username) return;

    const userStatusRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // A. Fetch saved status from Cloudflare (Persistent DB)
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) { console.error("Could not fetch saved status"); }

            // B. Set Online in Firebase with that saved status
            update(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
                status_text: savedStatus // Restores your status on reload!
            });

            onDisconnect(userStatusRef).remove();
        }
    });

    return () => unsubscribe();
  }, [username]);


  // 2. STUDY TIMER LOGIC (Batched)
  useEffect(() => {
    if (!username || !isStudying) return;

    const flushMinutes = () => {
        const amount = unsavedMinutesRef.current;
        if (amount > 0) {
            // Update Cloudflare (Persistent Record)
            const today = new Date().toISOString().split('T')[0];
            fetch(`${WORKER_URL}/study/update`, {
                method: "POST",
                body: JSON.stringify({ username }), // Worker handles logic
                headers: { "Content-Type": "application/json" }
            }).catch(()=>{});

            // Update Firebase (Realtime View)
            set(ref(db, `/timers/${username}/total_minutes`), increment(amount)); 
            
            unsavedMinutesRef.current = 0;
        }
    };

    update(ref(db, `/status/${username}`), { is_studying: true });

    // Loop: Update local UI every 1 min, flush to server every 5 min
    const interval = setInterval(() => {
        unsavedMinutesRef.current += 1;

        // Optimistic UI Update
        setOnlineUsers(prev => {
            const updated = prev.map(user => 
                user.username === username ? { ...user, total_study_time: user.total_study_time + 60 } : user
            );
            return updated.sort((a, b) => b.total_study_time - a.total_study_time);
        });

        // Flush to DB/Firebase every 5 mins
        if (unsavedMinutesRef.current >= 5) flushMinutes();

    }, 60000);

    const handleBeforeUnload = () => { flushMinutes(); update(ref(db, `/status/${username}`), { is_studying: false }); };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        flushMinutes();
        if (username) update(ref(db, `/status/${username}`), { is_studying: false });
    };
  }, [username, isStudying]);


  // 3. FETCH LEADERBOARD (Realtime Listener)
  useEffect(() => {
    const statusRef = ref(db, '/status');
    const timersRef = ref(db, '/timers');

    const unsub = onValue(statusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        onValue(timersRef, (timerSnap) => {
            const timerData = timerSnap.val() || {};
            const usersList: OnlineUser[] = Object.keys(statusData).map((key) => {
                let minutes = timerData[key]?.total_minutes || 0;
                if (key === username) minutes += unsavedMinutesRef.current; // Add local buffer

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
  }, [username]);


  // --- ACTIONS ---

  const joinSession = useCallback(() => setIsStudying(true), []);
  const leaveSession = useCallback(() => setIsStudying(false), []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    
    // 1. Update Realtime (Instant)
    const statusRef = ref(db, `/status/${username}`);
    await update(statusRef, { status_text: msg });

    // 2. Ping Database (Persistent)
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("DB Ping failed", e));

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