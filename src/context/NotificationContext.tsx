"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firestore } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
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
  type?: 'global' | 'personal';
}

interface NotificationContextType {
  notifications: Notification[];
  userNotifications: Notification[];
  globalNotifications: Notification[];
  addNotification: (message: string, targetUser?: string, link?: string, type?: 'global' | 'personal') => Promise<void>;
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

  // 2. LISTEN TO USER-SPECIFIC FIRESTORE COLLECTION
  useEffect(() => {
    if (!username) return;

    const notificationsRef = collection(firestore, 'users', username, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now(),
          link: data.link,
          read: data.read,
          type: 'personal' // Force type
        };
      });
      setUserNotifications(loaded);
    });

    return () => unsubscribe();
  }, [username]);

  // 3. LISTEN TO GLOBAL NOTIFICATIONS (FIRESTORE)
  useEffect(() => {
    const globalRef = collection(firestore, 'global_notifications');
    const q = query(globalRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now(),
          link: data.link,
          type: 'global' // Force type
        };
      });
      setGlobalNotifications(loaded);
    });
    return () => unsubscribe();
  }, []);

  // 4. HANDLE NEW NOTIFICATION SIDE EFFECTS (Toast & Sound)
  useEffect(() => {
    // Combine and sort to find the absolute latest
    const all = [...userNotifications, ...globalNotifications].sort((a, b) => b.timestamp - a.timestamp);

    if (all.length > 0) {
      const latest = all[0];
      // Only notify if it's very recent (within 10s) and NOT read locally
      const isRecent = Date.now() - latest.timestamp < 10000;
      const isRead = readIds.includes(latest.id);

      // We use a ref or simple check to ensure we don't spam. 
      // Actually, since this effect runs on [userNotifications, globalNotifications], 
      // it runs when list updates. We just need to check if we *should* notify for the top one.
      // But we avoid notify if we already read it.

      // To strictly avoid re-notifying for the SAME id if it renders twice, we can check a "lastNotifiedId" ref, 
      // but for now, checking !isRead and isRecent is usually enough unless the user refreshes constantly within 10s.
      // Let's rely on isRead.

      if (isRecent && !isRead) {
        // Prevent double toast for the same ID in this session? 
        // Implementation detail: The 'readIds' might update later. 
        // Let's just fire. 
        // Ideally we want to track 'lastToastedId' to be safe.
      }
    }
  }, [userNotifications, globalNotifications, readIds]);

  // RE-IMPLEMENTED SIDE EFFECT LOGIC WITH REF
  const lastToastedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const all = [...userNotifications, ...globalNotifications].sort((a, b) => b.timestamp - a.timestamp);
    if (all.length === 0) return;

    const latest = all[0];
    const now = Date.now();
    const timeDiff = now - latest.timestamp;
    const isRecent = timeDiff < 10000;
    const isRead = readIds.includes(latest.id);

    // Check triggers
    if (isRecent && !isRead && latest.id !== lastToastedIdRef.current) {
      lastToastedIdRef.current = latest.id;
      toast({
        title: latest.type === 'global' ? "System Broadcast" : "New Notification",
        description: latest.message
      });
      playSound();
    }
  }, [userNotifications, globalNotifications, readIds, toast]);

  // 3. SEND TO FIREBASE
  // 3. SEND TO FIRESTORE
  // 3. SEND TO FIRESTORE
  const addNotification = async (message: string, targetUser?: string, link?: string, type: 'global' | 'personal' = 'global') => {
    try {
      if (targetUser) {
        // Personal Notification
        const userRef = collection(firestore, 'users', targetUser, 'notifications');
        await addDoc(userRef, {
          message,
          link,
          type: 'personal',
          timestamp: serverTimestamp(),
          read: false
        });
      } else {
        // Global Notification
        const globalRef = collection(firestore, 'global_notifications');
        await addDoc(globalRef, {
          message,
          link,
          type: 'global',
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("[NotificationContext] Failed to add notification", error);
    }
  };

  // 4. Mark ONE as Read
  const markAsRead = (id: string) => {
    // 1. Optimistic Local Update
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      localStorage.setItem('liorea-read-notifications', JSON.stringify(newReadIds));
    }

    // 2. Identify and Update Backend (Personal Only)
    // We check if this ID exists in our userNotifications list
    const isPersonal = userNotifications.some(n => n.id === id);
    if (isPersonal && username) {
      // Update Firestore
      const notifRef = doc(firestore, 'users', username, 'notifications', id);
      updateDoc(notifRef, { read: true }).catch(err => console.error("Failed to mark read on backend", err));
    }
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
    read: n.read || readIds.includes(n.id)
  }));

  return (
    <NotificationContext.Provider value={{
      notifications: displayedNotifications,
      userNotifications: userNotifications.map(n => ({ ...n, read: n.read || readIds.includes(n.id) })),
      globalNotifications: globalNotifications.map(n => ({ ...n, read: readIds.includes(n.id) })), // Global ones don't have 'read' on backend usually, but we track locally
      addNotification,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};