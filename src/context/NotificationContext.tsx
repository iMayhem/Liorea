"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { usePresence } from './PresenceContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read?: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, targetUser?: string, link?: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { username } = usePresence(); 
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  // 1. Load "Read" status from Local Storage
  useEffect(() => {
    try {
      const localRead = localStorage.getItem('liorea-read-notifications');
      if (localRead) setReadIds(JSON.parse(localRead));
    } catch (e) {}
  }, []);

  // 2. LISTEN TO USER-SPECIFIC FIREBASE NODE
  useEffect(() => {
    if (!username) return;

    // Listen to "user_notifications/{username}"
    const notificationsRef = query(ref(db, `user_notifications/${username}`), limitToLast(20));

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedNotifications: Notification[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          message: value.message,
          timestamp: value.timestamp,
          link: value.link
        }));
        
        // Sort by newest first
        loadedNotifications.sort((a, b) => b.timestamp - a.timestamp);
        
        // CHECK FOR NEW NOTIFICATIONS (To show Toast)
        // We check if the newest one is very recent (within 5 seconds) to avoid spamming on page reload
        if (loadedNotifications.length > 0) {
            const latest = loadedNotifications[0];
            const isRecent = Date.now() - latest.timestamp < 5000;
            const isRead = readIds.includes(latest.id);
            
            // If it's new, recent, and we haven't seen it in this session list yet
            if (isRecent && !isRead && (!notifications.length || latest.id !== notifications[0].id)) {
                toast({ 
                    title: "New Notification", 
                    description: latest.message,
                });
            }
        }

        setNotifications(loadedNotifications);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [username, readIds]); // Re-run if username changes

  // 3. SEND TO FIREBASE
  const addNotification = async (message: string, targetUser?: string, link?: string) => {
    try {
      if (targetUser) {
          // Send to specific user
          const notificationsRef = ref(db, `user_notifications/${targetUser}`);
          await push(notificationsRef, {
            message,
            link,
            timestamp: serverTimestamp()
          });
      } else {
          // Fallback: Global notification (Optional, if you want system-wide alerts)
          const notificationsRef = ref(db, `notifications`);
          await push(notificationsRef, {
            message,
            link,
            timestamp: serverTimestamp()
          });
      }
    } catch (error) {
      console.error("Failed to add notification", error);
    }
  };

  // 4. Mark ONE as Read
  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('liorea-read-notifications', JSON.stringify(newReadIds));
  };

  // 5. Mark ALL as Read
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const combinedIds = Array.from(new Set([...readIds, ...allIds]));
    
    setReadIds(combinedIds);
    localStorage.setItem('liorea-read-notifications', JSON.stringify(combinedIds));
  };

  const displayedNotifications = notifications.map(n => ({
    ...n,
    read: readIds.includes(n.id)
  }));

  return (
    <NotificationContext.Provider value={{ notifications: displayedNotifications, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};