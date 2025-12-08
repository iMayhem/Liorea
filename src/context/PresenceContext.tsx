"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  totalStudyTime?: number; 
  lastSeen?: string; 
}

interface PresenceContextType {
  username: string;
  onlineUsers: OnlineUser[];
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username] = useState('User_' + Math.floor(Math.random() * 1000));
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
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
    onlineUsers,
  }), [username, onlineUsers]);

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
