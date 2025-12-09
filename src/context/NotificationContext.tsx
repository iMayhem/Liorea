"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  // 1. Load "Read" status from Local Storage
  useEffect(() => {
    try {
      const localRead = localStorage.getItem('liorea-read-notifications');
      if (localRead) setReadIds(JSON.parse(localRead));
    } catch (e) {}
  }, []);

  // 2. LISTEN TO FIREBASE (Realtime)
  useEffect(() => {
    const notificationsRef = ref(db, 'notifications');

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedNotifications = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          message: value.message,
          timestamp: value.timestamp,
        }));
        
        // Sort by newest first
        loadedNotifications.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(loadedNotifications);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. SEND TO FIREBASE
  const addNotification = async (message: string) => {
    try {
      const notificationsRef = ref(db, 'notifications');
      await push(notificationsRef, {
        message,
        timestamp: serverTimestamp()
      });
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

// Ensure this is exported!
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};