
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  status?: 'Online' | 'Offline';
  last_seen?: number; 
  total_study_time?: number; 
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
  const pathname = usePathname();
  const { toast } = useToast();
  
  // Load initial state
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('liorea-username');
        if (storedUser) setUsernameState(storedUser);
    } catch (e) { console.error(e); }
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
      localStorage.setItem('liorea-username', name);
    } else {
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, []);

  const joinSession = useCallback(() => {
    setIsStudying(true);
  }, []);

  const leaveSession = useCallback(() => {
    setIsStudying(false);
  }, []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    try {
        await fetch(`${WORKER_URL}/user/status`, {
            method: 'POST',
            body: JSON.stringify({ username, status_text: msg }),
            headers: { 'Content-Type': 'application/json' }
        });
        // Optimistic update
        setOnlineUsers(prev => prev.map(u => u.username === username ? { ...u, status_text: msg } : u));
        toast({ title: "Status Updated", description: "Your status is visible for 24 hours." });
    } catch (e) { console.error(e); }
  }, [username, toast]);

  const renameUser = useCallback(async (newName: string) => {
    if (!username) return false;
    try {
        const res = await fetch(`${WORKER_URL}/user/rename`, {
            method: 'POST',
            body: JSON.stringify({ oldUsername: username, newUsername: newName }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            setUsername(newName);
            toast({ title: "Username Changed", description: `You are now known as ${newName}` });
            return true;
        } else {
            toast({ variant: "destructive", title: "Error", description: data.error });
            return false;
        }
    } catch (e) { return false; }
  }, [username, setUsername, toast]);

  // 1. General Presence Heartbeat (Runs always when logged in)
  useEffect(() => {
    if (!username) return;
    
    const sendPresence = () => {
      fetch(`${WORKER_URL}/heartbeat`, { 
          method: "POST", 
          body: JSON.stringify({ username }), 
          headers: { "Content-Type": "application/json" } 
      }).catch(console.error);
    };

    sendPresence(); // Send immediately
    const interval = setInterval(sendPresence, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [username]);

  // 2. Study Time Accumulator (Runs ONLY when isStudying is true)
  useEffect(() => {
    if (!username || !isStudying) return;

    const logStudyMinute = () => {
       fetch(`${WORKER_URL}/study/update`, { 
           method: "POST", 
           body: JSON.stringify({ username }), 
           headers: { "Content-Type": "application/json" } 
       }).catch((e) => {
           console.error("Network error, study time not counted for this minute", e);
           // Logic: If internet fails, this fetch fails, time isn't counted. Correct behavior.
       });
    };

    // Log immediately on join
    logStudyMinute();

    // Log every 60 seconds
    const interval = setInterval(logStudyMinute, 60000);

    return () => clearInterval(interval);
  }, [username, isStudying]);

  // 3. Handle Tab Close / Browser Exit (Try to capture partial time or cleanup)
  useEffect(() => {
      const handleBeforeUnload = () => {
          if (username && isStudying) {
              // sendBeacon is more reliable than fetch during page unload
              const blob = new Blob([JSON.stringify({ username })], { type: 'application/json' });
              navigator.sendBeacon(`${WORKER_URL}/study/update`, blob);
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [username, isStudying]);

  // 4. Poll for Leaderboard/Online Users Data
  useEffect(() => {
    const checkOnlineUsers = () => {
      fetch(`${WORKER_URL}/status`)
        .then(res => res.json())
        .then((users: any[]) => {
            const formattedUsers = users.map(u => ({ 
                ...u, 
                total_study_time: (u.total_minutes || 0) * 60 // Convert server minutes to seconds for display
            }));
            setOnlineUsers(formattedUsers);
        })
        .catch(console.error);
    };

    checkOnlineUsers(); // Initial fetch
    const statusInterval = setInterval(checkOnlineUsers, 5000); // Check every 5s for live updates

    return () => clearInterval(statusInterval);
  }, []);

  const value = useMemo(() => ({
    username, setUsername, onlineUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser
  }), [username, setUsername, onlineUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) {
        throw new Error("usePresence must be used within a PresenceProvider");
    }
    return c;
};
