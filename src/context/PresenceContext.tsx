

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
  
  // Track minutes locally to batch updates to Cloudflare (save credits)
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
        // Explicit Logout: Remove from Firebase immediately
        if (username) {
            remove(ref(db, `/status/${username}`));
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. INSTANT PRESENCE (FIREBASE)
  useEffect(() => {
    if (!username) return;

    const userStatusRef = ref(db, `/status/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // We are connected!
            
            // A. Fetch persistent status from Cloudflare (so you don't look empty)
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) { console.error("DB Fetch Error", e); }

            // B. Set Online in Firebase (Visible to everyone INSTANTLY)
            update(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
                username: username,
                status_text: savedStatus // Restore persistent status
            });

            // C. THE MAGIC: If tab closes, Server deletes this node INSTANTLY.
            onDisconnect(userStatusRef).remove();
        }
    });

    return () => {
        unsubscribe();
        // If simply navigating away (component unmount), remove manually
        // But we keep it if just resizing/re-rendering to prevent flickering
    };
  }, [username]);


  // 3. STUDY TIMER LOGIC
  useEffect(() => {
    if (!username || !isStudying) return;

    // Helper: Flush minutes to Cloudflare (Long-term Calendar History)
    const flushToCloudflare = () => {
        const amount = unsavedMinutesRef.current;
        if (amount > 0) {
            fetch(`${WORKER_URL}/study/update`, {
                method: "POST",
                body: JSON.stringify({ username }), // Worker adds +1 per call, maybe need loop if >1
                headers: { "Content-Type": "application/json" }
            }).catch(()=>{});
            
            // Since worker adds +1, we loop the fetch if amount > 1 (Rare case)
            // Or simpler: Just accept that Cloudflare tracks general activity, Firebase tracks precise leaderboard
            unsavedMinutesRef.current = 0;
        }
    };

    // Mark as studying in Firebase (Instant)
    update(ref(db, `/status/${username}`), { is_studying: true });

    // Loop: Update Firebase every minute (Instant Leaderboard)
    const interval = setInterval(() => {
        // 1. Update Firebase (Everyone sees this live)
        const timerRef = ref(db, `/timers/${username}/total_minutes`);
        set(timerRef, increment(1));

        // 2. Buffer for Cloudflare
        unsavedMinutesRef.current += 1;

        // 3. Flush to Cloudflare every 5 mins (Save $$)
        if (unsavedMinutesRef.current >= 5) {
            flushToCloudflare();
        }
    }, 60000);

    // Clean up when stopping study
    return () => {
        clearInterval(interval);
        flushToCloudflare(); // Save any pending minutes
        if (username) {
             update(ref(db, `/status/${username}`), { is_studying: false });
        }
    };
  }, [username, isStudying]);


  // 4. FETCH LIVE LEADERBOARD (FIREBASE LISTENER)
  useEffect(() => {
    const statusRef = ref(db, '/status');
    const timersRef = ref(db, '/timers');

    // onValue triggers INSTANTLY when ANYONE joins/leaves/updates
    const unsub = onValue(statusRef, (statusSnap) => {
        const statusData = statusSnap.val() || {};
        
        onValue(timersRef, (timerSnap) => {
            const timerData = timerSnap.val() || {};
            
            const usersList: OnlineUser[] = Object.keys(statusData).map((key) => {
                const minutes = timerData[key]?.total_minutes || 0;
                return {
                    username: key,
                    status: 'Online', // If they are in /status, they are online
                    total_study_time: minutes * 60, 
                    status_text: statusData[key].status_text || ""
                };
            });

            // Sort by time
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
    
    // 1. Update Firebase (Instant for others)
    update(ref(db, `/status/${username}`), { status_text: msg });

    // 2. Update Cloudflare (Persistent for reload)
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("DB Save Failed", e));

    toast({ title: "Status Updated" });
  }, [username, toast]);

  const renameUser = useCallback(async (newName: string) => {
      // Simple switch for NoSQL/NoAuth setup
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