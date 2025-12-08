"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  status?: 'Online' | 'Offline';
  last_seen?: number; 
  totalStudyTime?: number; 
}

interface PresenceContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  onlineUsers: OnlineUser[];
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('liorea-username');
        if (storedUser) {
            setUsernameState(storedUser);
        }
    } catch (e) {
        console.error("Could not access localStorage", e);
    }
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        try {
            localStorage.setItem('liorea-username', name);
        } catch (e) {
             console.error("Could not access localStorage", e);
        }
    } else {
        try {
            localStorage.removeItem('liorea-username');
        } catch (e) {
            console.error("Could not access localStorage", e);
        }
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    const sendHeartbeat = () => {
      fetch(`${WORKER_URL}/heartbeat`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" }
      }).catch(error => console.error("Heartbeat failed:", error));
    };

    const checkOnlineUsers = () => {
      fetch(`${WORKER_URL}/status`)
        .then(res => res.json())
        .then(users => setOnlineUsers(users))
        .catch(error => console.error("Failed to check online users:", error));
    };

    sendHeartbeat();
    checkOnlineUsers();

    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    const statusInterval = setInterval(checkOnlineUsers, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(statusInterval);
    };
  }, [username]);

  const value = useMemo(() => ({
    username,
    setUsername,
    onlineUsers,
  }), [username, setUsername, onlineUsers]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};
