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
  
  // Local buffer to reduce Cloudflare writes
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
        // Explicit Logout
        if (username) {
            // Remove from Firebase immediately
            remove(ref(db, `/study_room_presence/${username}`));
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. REALTIME PRESENCE (THE FIX)
  // This handles the "Study Room" list. 
  useEffect(() => {
    if (!username) return;

    // We only track presence if the user is explicitly "Studying" (joined the room)
    if (!isStudying) {
        // Ensure we are removed if we are not studying
        remove(ref(db, `/study_room_presence/${username}`));
        return;
    }

    const presenceRef = ref(db, `/study_room_presence/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // A. Fetch persistent status from Cloudflare (so you don't look empty)
            let savedStatus = "";
            let savedMinutes = 0;
            
            // Optional: Fetch initial minutes from Cloudflare to sync total time
            // For now, we assume Firebase holds the live session data or starts at 0 for session
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) { console.error("DB Fetch Error", e); }

            // B. Add myself to the Study Room list
            set(presenceRef, {
                username: username,
                status: 'Online',
                joined_at: serverTimestamp(),
                status_text: savedStatus,
                // We initialize session time here, or pull total from DB if needed
                total_study_time: 0 
            });

            // C. THE MAGIC: Server-side auto-delete on disconnect
            // This runs on Google's servers if your internet cuts or tab closes
            onDisconnect(presenceRef).remove();
        }
    });

    return () => {
        unsubscribe();
        // If the component unmounts (navigating away), remove manually
        if (username) remove(presenceRef);
    };
  }, [username, isStudying]); // Depend on isStudying so we join/leave based on button clicks


  // 3. LISTEN TO STUDY ROOM (Update UI)
  useEffect(() => {
    const roomRef = ref(db, '/study_room_presence');

    const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const usersList: OnlineUser[] = Object.values(data).map((u: any) => ({
                username: u.username,
                status: 'Online',
                // Use the time from Firebase, or 0
                total_study_time: u.total_study_time || 0, 
                status_text: u.status_text || ""
            }));
            
            // Sort by time (highest first)
            usersList.sort((a, b) => b.total_study_time - a.total_study_time);
            setOnlineUsers(usersList);
        } else {
            setOnlineUsers([]);
        }
    });

    return () => unsubscribe();
  }, []);


  // 4. STUDY TIMER (Logic to count up)
  useEffect(() => {
    if (!username || !isStudying) return;

    // Flush to Cloudflare (Persistent History)
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

    // Timer Loop: Runs every 60s
    const interval = setInterval(() => {
        // 1. Update Firebase Presence (So everyone sees my time go up live)
        // We update the specific user's node in the presence list
        const myPresenceRef = ref(db, `/study_room_presence/${username}/total_study_time`);
        set(myPresenceRef, increment(60)); // Add 60 seconds

        // 2. Buffer for Cloudflare
        unsavedMinutesRef.current += 1;

        // 3. Flush to Cloudflare every 5 mins
        if (unsavedMinutesRef.current >= 5) {
            flushToCloudflare();
        }
    }, 60000);

    return () => {
        clearInterval(interval);
        flushToCloudflare();
    };
  }, [username, isStudying]);


  // --- ACTIONS ---

  const joinSession = useCallback(() => {
      setIsStudying(true);
      // Logic handled in useEffect [username, isStudying]
  }, []);

  const leaveSession = useCallback(() => {
      setIsStudying(false);
      if (username) {
          // Immediately remove from Firebase
          remove(ref(db, `/study_room_presence/${username}`));
      }
  }, [username]);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    
    // 1. Update Firebase (Instant for others in room)
    if (isStudying) {
        update(ref(db, `/study_room_presence/${username}`), { status_text: msg });
    }

    // 2. Update Cloudflare (Persistent for next reload)
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("DB Save Failed", e));

    toast({ title: "Status Updated" });
  }, [username, isStudying, toast]);

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