
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export interface OnlineUser {
  username: string;
  status?: 'Online' | 'Offline';
  last_seen?: number; 
  total_study_time?: number; 
}

interface PresenceContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  onlineUsers: OnlineUser[];
  // New controls for the session
  isStudying: boolean;
  joinSession: () => void;
  leaveSession: () => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  // Default to false, but check localStorage in useEffect
  const [isStudying, setIsStudying] = useState(false);
  
  // 1. Load saved data on startup
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('liorea-username');
        if (storedUser) setUsernameState(storedUser);

        // Check if we were already studying (persistence on refresh)
        const sessionState = localStorage.getItem('liorea-is-studying');
        if (sessionState === 'true') setIsStudying(true);
    } catch (e) {
        console.error("Could not access localStorage", e);
    }
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        try {
            localStorage.setItem('liorea-username', name);
        } catch(e) {
            console.error("Could not access localStorage", e);
        }
    } else {
        try {
            localStorage.removeItem('liorea-username');
            // If logging out, also stop studying
            setIsStudying(false);
            localStorage.removeItem('liorea-is-studying');
        } catch (e) {
            console.error("Could not access localStorage", e);
        }
    }
  }, []);

  // 2. Functions to Join/Leave (Discord style)
  const joinSession = useCallback(() => {
    setIsStudying(true);
    try {
        localStorage.setItem('liorea-is-studying', 'true');
    } catch(e) {
        console.error("Could not access localStorage", e);
    }
    console.log("Joined Study Session");
  }, []);

  const leaveSession = useCallback(() => {
    setIsStudying(false);
    try {
        localStorage.setItem('liorea-is-studying', 'false');
    } catch(e) {
        console.error("Could not access localStorage", e);
    }
    console.log("Left Study Session");
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
    
    // 3. The Timer Logic
    const updateStudyTime = () => {
       // Only count if the switch is ON
       if (!isStudying) {
         return; 
       }

       console.log("Studying in background... +5 mins added.");
       fetch(`${WORKER_URL}/study/update`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" }
      }).catch(error => console.error("Study time update failed:", error));
    }

    const checkOnlineUsers = () => {
      fetch(`${WORKER_URL}/status`)
        .then(res => res.json())
        .then((users: any[]) => {
            const formattedUsers = users.map(u => ({
                ...u,
                total_study_time: (u.total_minutes || 0) * 60 
            }));
            setOnlineUsers(formattedUsers);
        })
        .catch(error => console.error("Failed to check online users:", error));
    };

    // Run immediately
    sendHeartbeat();
    checkOnlineUsers();

    // Intervals
    const heartbeatInterval = setInterval(sendHeartbeat, 60000); 
    const studyTimeInterval = setInterval(updateStudyTime, 300000); // 5 Minutes
    const statusInterval = setInterval(checkOnlineUsers, 10000); 

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(studyTimeInterval);
      clearInterval(statusInterval);
    };
  }, [username, isStudying]); // Re-run if isStudying changes

  const value = useMemo(() => ({
    username,
    setUsername,
    onlineUsers,
    isStudying,
    joinSession,
    leaveSession
  }), [username, setUsername, onlineUsers, isStudying, joinSession, leaveSession]);

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
