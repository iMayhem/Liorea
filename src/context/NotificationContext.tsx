
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { usePresence } from './PresenceContext';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { username } = usePresence();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  
  const getStorageKey = () => {
    if (!username) return null;
    return `liorea-read-notifications-${username}`;
  }

  // 1. Load "Read" status from Local Storage when username is available
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    try {
      const localRead = localStorage.getItem(storageKey);
      if (localRead) setReadIds(JSON.parse(localRead));
    } catch (e) {
      // Could be parsing error
      console.error("Failed to load read notifications from localStorage", e);
    }
  }, [username]);

  // 2. LISTEN TO FIREBASE (Realtime)
  useEffect(() => {
    const notificationsRef = ref(db, 'notifications');

    // onValue triggers instantly whenever data changes in Firebase
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
        timestamp: serverTimestamp() // Uses server time to be accurate
      });
    } catch (error) {
      console.error("Failed to add notification via Firebase", error);
    }
  };

  // 4. Mark as Read (Local)
  const markAsRead = (id: string) => {
    const storageKey = getStorageKey();
    if (!storageKey || readIds.includes(id)) return; // Don't do anything if no user or already read

    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem(storageKey, JSON.stringify(newReadIds));
  };

  const displayedNotifications = notifications.map(n => ({
    ...n,
    read: readIds.includes(n.id)
  }));

  return (
    <NotificationContext.Provider value={{ notifications: displayedNotifications, addNotification, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications error');
  return context;
};
