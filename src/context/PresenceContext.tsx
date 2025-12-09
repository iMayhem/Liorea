
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
  status_text?: string; // New field for the message
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
    try {
        const storedUser = localStorage.getItem('liorea-username');
        if (storedUser) setUsernameState(storedUser);
        const sessionState = localStorage.getItem('liorea-is-studying');
        if (sessionState === 'true') setIsStudying(true);
    } catch (e) { console.error(e); }
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
      localStorage.setItem('liorea-username', name);
    } else {
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
        localStorage.removeItem('liorea-is-studying');
    }
  }, []);

  const joinSession = useCallback(() => {
    setIsStudying(true);
    localStorage.setItem('liorea-is-studying', 'true');
  }, []);

  const leaveSession = useCallback(() => {
    setIsStudying(false);
    localStorage.setItem('liorea-is-studying', 'false');
  }, []);

  // NEW: Update Status Message
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

  // NEW: Rename User
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

  useEffect(() => {
    if (!username) return;
    const sendHeartbeat = () => {
      fetch(`${WORKER_URL}/heartbeat`, { method: "POST", body: JSON.stringify({ username }), headers: { "Content-Type": "application/json" } }).catch(console.error);
    };
    const updateStudyTime = () => {
       if (!isStudying) return;
       fetch(`${WORKER_URL}/study/update`, { method: "POST", body: JSON.stringify({ username }), headers: { "Content-Type": "application/json" } }).catch(console.error);
    }
    const checkOnlineUsers = () => {
      fetch(`${WORKER_URL}/status`).then(res => res.json()).then((users: any[]) => {
            const formattedUsers = users.map(u => ({ ...u, total_study_time: (u.total_minutes || 0) * 60 }));
            setOnlineUsers(formattedUsers);
        }).catch(console.error);
    };

    sendHeartbeat();
    checkOnlineUsers();

    const heartbeatInterval = setInterval(sendHeartbeat, 60000); 
    const studyTimeInterval = setInterval(updateStudyTime, 300000); 
    const statusInterval = setInterval(checkOnlineUsers, 10000); 

    return () => { clearInterval(heartbeatInterval); clearInterval(studyTimeInterval); clearInterval(statusInterval); };
  }, [username, pathname, isStudying]);

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
