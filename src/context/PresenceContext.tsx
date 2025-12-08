
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
// 1. Import usePathname to know where the user is
import { usePathname } from 'next/navigation';

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
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  // 2. Get the current URL path
  const pathname = usePathname();
  
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

    // 1. Heartbeat: Keeps you "Online" anywhere on the site
    const sendHeartbeat = () => {
      fetch(`${WORKER_URL}/heartbeat`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" }
      }).catch(error => console.error("Heartbeat failed:", error));
    };
    
    // 2. Study Update: NOW CHECKS IF YOU ARE IN THE STUDY ROOM
    const updateStudyTime = () => {
       // >>> CRITICAL CHECK: Only update if on /study-together <<<
       if (pathname !== '/study-together') {
         console.log("Not in study room, skipping timer update.");
         return; 
       }

       console.log("In study room, updating timer +5 mins...");
       fetch(`${WORKER_URL}/study/update`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" }
      }).catch(error => console.error("Study time update failed:", error));
    }

    // 3. Check Status (Get list of users and scores)
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

    // Initial run
    sendHeartbeat();
    checkOnlineUsers();

    // --- TIMERS ---
    
    // Heartbeat runs every 60s (keeps you Green/Online)
    const heartbeatInterval = setInterval(sendHeartbeat, 60000); 
    
    // Study Timer runs every 5 minutes (Only counts if on /study-together)
    const studyTimeInterval = setInterval(updateStudyTime, 300000); 
    
    // Refresh List runs every 10 seconds
    const statusInterval = setInterval(checkOnlineUsers, 10000); 

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(studyTimeInterval);
      clearInterval(statusInterval);
    };
  // 3. Add pathname to dependencies so the effect updates when you change pages
  }, [username, pathname]);

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
