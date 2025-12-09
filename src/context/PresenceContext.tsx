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
  
  // Local buffer for Cloudflare
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
        // Logout: Remove from Global Status
        if (username) remove(ref(db, `/status/${username}`));
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. GLOBAL PRESENCE (Run anytime we have a username)
  // This makes you show up in "Community" immediately
  useEffect(() => {
    if (!username) return;

    const userStatusRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // A. Fetch persistent status text from Cloudflare
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) { console.error("DB Fetch Error", e); }

            // B. Set Online in Global List
            update(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
                status_text: savedStatus,
                is_studying: isStudying // Sync current state
            });

            // C. INSTANT DISCONNECT: Delete me if tab closes
            onDisconnect(userStatusRef).remove();
        }
    });

    return () => unsubscribe();
  }, [username]); // Removed isStudying dependency so it doesn't reset on mode switch


  // 3. STUDY LOGIC (Updates the existing user node)
  useEffect(() => {
    if (!username) return;

    // Update the "is_studying" flag in Firebase
    update(ref(db, `/status/${username}`), { is_studying: isStudying });

    if (!isStudying) return; // Stop here if not studying

    // --- TIMER LOGIC ---
    
    // Flush to Cloudflare
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
        // 1. Update Firebase (Live Leaderboard)
        set(ref(db, `/timers/${username}/total_minutes`), increment(1));

        // 2. Buffer for Cloudflare
        unsavedMinutesRef.current += 1;

        // 3. Flush every 5 mins
        if (unsavedMinutesRef.current >= 5) flushToCloudflare();
    }, 60000);

    return () => {
        clearInterval(interval);
        flushToCloudflare();
    };
  }, [username, isStudying]);


  // 4. FETCH COMMUNITY LIST (Live)
  useEffect(() => {
    const statusRef = ref(db, '/status');
    const timersRef = ref(db, '/timers');

    const unsub = onValue(statusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        
        onValue(timersRef, (timerSnap) => {
            const timerData = timerSnap.val() || {};
            
            const usersList: OnlineUser[] = Object.keys(statusData).map((key) => {
                const minutes = timerData[key]?.total_minutes || 0;
                return {
                    username: key,
                    status: 'Online',
                    total_study_time: minutes * 60, 
                    status_text: statusData[key].status_text || "",
                    is_studying: statusData[key].is_studying || false
                };
            });

            // Sort: Studying users first, then by time
            usersList.sort((a, b) => {
                if (a.is_studying && !b.is_studying) return -1;
                if (!a.is_studying && b.is_studying) return 1;
                return b.total_study_time - a.total_study_time;
            });
            
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
    
    update(ref(db, `/status/${username}`), { status_text: msg });

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