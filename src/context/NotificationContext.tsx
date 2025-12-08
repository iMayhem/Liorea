"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: number;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string) => void;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem('liorea-notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Could not load notifications from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('liorea-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error("Could not save notifications to localStorage", error);
    }
  }, [notifications]);

  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
