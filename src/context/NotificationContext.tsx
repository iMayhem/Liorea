"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { usePresence } from '@/features/study';
import { useToast } from '@/hooks/use-toast';

// 🔔 SOUND URL (A soft glass ping)
// You can upload your own 'notification.mp3' to your R2 bucket and replace this URL later if you want.
const NOTIFICATION_SOUND = "https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/mention_notification.mp3";

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
  const [username, setUsername] = useState<string | null>(null);
  const { username: presenceUsername } = usePresence();

  useEffect(() => {
    if (presenceUsername) setUsername(presenceUsername);
  }, [presenceUsername]);

  const { toast } = useToast();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [globalNotifications, setGlobalNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  // Computed combined notifications
  const notifications = React.useMemo(() => {
    const combined = [...userNotifications, ...globalNotifications];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [userNotifications, globalNotifications]);

  // 1. Load "Read" status from Local Storage
  useEffect(() => {
    try {
      const localRead = localStorage.getItem('liorea-read-notifications');
      if (localRead) setReadIds(JSON.parse(localRead));
    } catch (e) { }
  }, []);

  // --- HELPER: PLAY SOUND ---
  const playSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0.4; // Keep it subtle, not ear-piercing
      audio.play().catch(e => console.warn("Audio play blocked (user needs to interact first)", e));
    } catch (e) {
      // Ignore audio errors
    }
  };

  // 2. LISTEN TO USER-SPECIFIC FIREBASE NODE
  useEffect(() => {
    if (!username) return;

    const notificationsRef = query(ref(db, `user_notifications/${username}`), limitToLast(20));

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded: Notification[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          message: value.message,
          timestamp: value.timestamp,
          link: value.link
        }));

        // CHECK FOR NEW (User)
        if (loaded.length > 0) {
          // Sort temp to get latest
          loaded.sort((a, b) => b.timestamp - a.timestamp);
          const latest = loaded[0];
          const isRecent = Date.now() - latest.timestamp < 10000; // Increased window slightly
          const isRead = readIds.includes(latest.id);

          // Check if it's actually new compared to current state
          const currentLatestId = userNotifications.length > 0 ? userNotifications.sort((a, b) => b.timestamp - a.timestamp)[0].id : null;

          if (isRecent && !isRead && latest.id !== currentLatestId) {
            toast({ title: "New Notification", description: latest.message });
            playSound();
          }
        }
        setUserNotifications(loaded);
      } else {
        setUserNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [username, readIds]); // Intentionally omitting userNotifications from dependency to avoid loop, handled by ref check or just letting logic run

  // 3. LISTEN TO GLOBAL NOTIFICATIONS
  useEffect(() => {
    const globalRef = query(ref(db, `notifications`), limitToLast(20));

    const unsubscribe = onValue(globalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded: Notification[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          message: value.message,
          timestamp: value.timestamp,
          link: value.link
        }));

        // CHECK FOR NEW (Global)
        if (loaded.length > 0) {
          loaded.sort((a, b) => b.timestamp - a.timestamp);
          const latest = loaded[0];
          const isRecent = Date.now() - latest.timestamp < 10000;
          const isRead = readIds.includes(latest.id);

          const currentLatestId = globalNotifications.length > 0 ? globalNotifications.sort((a, b) => b.timestamp - a.timestamp)[0].id : null;

          if (isRecent && !isRead && latest.id !== currentLatestId) {
            toast({ title: "System Broadcast", description: latest.message });
            playSound();
          }
        }
        setGlobalNotifications(loaded);
      } else {
        setGlobalNotifications([]);
      }
    });
    return () => unsubscribe();
  }, [globalNotifications, readIds]);

  // 3. SEND TO FIREBASE
  const addNotification = async (message: string, targetUser?: string, link?: string) => {
    try {
      if (targetUser) {
        const notificationsRef = ref(db, `user_notifications/${targetUser}`);
        await push(notificationsRef, {
          message,
          link,
          timestamp: serverTimestamp()
        });
      } else {
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