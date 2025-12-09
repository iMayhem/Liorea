

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Cloudflare Worker URL
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
  
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) localStorage.setItem('liorea-username', name);
    else {
        // If logging out, tell server we left
        if (username) {
            fetch(`${WORKER_URL}/user/leave`, {
                method: "POST",
                body: JSON.stringify({ username }),
                headers: { "Content-Type": "application/json" }
            }).catch(()=>{});
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  const joinSession = useCallback(() => setIsStudying(true), []);
  
  const leaveSession = useCallback(() => {
      setIsStudying(false);
      // Immediately tell server we stopped studying (optional, usually heartbeat timeout handles it)
  }, []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    try {
        await fetch(`${WORKER_URL}/user/status`, {
            method: 'POST',
            body: JSON.stringify({ username, status_text: msg }),
            headers: { 'Content-Type': 'application/json' }
        });
        setOnlineUsers(prev => prev.map(u => u.username === username ? { ...u, status_text: msg } : u));
        toast({ title: "Status Updated" });
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
            return true;
        }
        return false;
    } catch (e) { return false; }
  }, [username, setUsername]);

  // 1. PRESENCE HEARTBEAT + TAB CLOSE HANDLER
  useEffect(() => {
    if (!username) return;
    
    // Normal Heartbeat (Every 60s)
    const sendHeartbeat = () => {
      if (document.hidden) return; 
      fetch(`${WORKER_URL}/heartbeat`, { 
          method: "POST", 
          body: JSON.stringify({ username }), 
          headers: { "Content-Type": "application/json" } 
      }).catch(()=>{});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000); 

    // TAB CLOSE / BROWSER CLOSE HANDLER
    const handleBeforeUnload = () => {
        // Prepare data blob
        const blob = new Blob([JSON.stringify({ username })], { type: 'application/json' });
        // Use sendBeacon - it survives the page close
        navigator.sendBeacon(`${WORKER_URL}/user/leave`, blob);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [username]);

  // 2. STUDY TIMER
  useEffect(() => {
    if (!username || !isStudying) return;

    const logMinute = () => {
       fetch(`${WORKER_URL}/study/update`, { 
           method: "POST", 
           body: JSON.stringify({ username }), 
           headers: { "Content-Type": "application/json" } 
       }).catch(()=>{});
    };

    logMinute();
    const interval = setInterval(logMinute, 60000); 
    return () => clearInterval(interval);
  }, [username, isStudying]);

  // 3. FETCH LEADERBOARD
  useEffect(() => {
    const fetchStatus = () => {
      if (document.hidden) return; 
      fetch(`${WORKER_URL}/status`)
        .then(res => res.json())
        .then((users: any[]) => {
            const formatted = users.map(u => ({ ...u, total_study_time: (u.total_minutes || 0) * 60 }));
            setOnlineUsers(formatted);
        }).catch(()=>{});
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); 
    return () => clearInterval(interval);
  }, [pathname, username]);

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

    