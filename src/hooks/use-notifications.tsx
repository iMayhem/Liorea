'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import type { SiteNotification } from '@/lib/types';
import { updateUserProfile } from '@/lib/db';

interface NotificationContextType {
    notifications: SiteNotification[];
    loading: boolean;
    hasNewNotification: boolean;
    newNotificationCount: number;
    updateLastChecked: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Function to update the favicon with a notification count
const updateFavicon = (count: number) => {
    if (typeof window === 'undefined') return;
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (!favicon) return;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (!context) return;

    const img = new Image();
    img.src = '/favicon.svg'; 

    img.onload = () => {
        context.drawImage(img, 0, 0, 32, 32);
        if (count > 0) {
            context.beginPath();
            context.arc(22, 10, 10, 0, 2 * Math.PI);
            context.fillStyle = 'red';
            context.fill();
            context.font = 'bold 16px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(count > 9 ? '9+' : count.toString(), 22, 11);
        }
        favicon.href = canvas.toDataURL('image/png');
    };
    
    img.onerror = () => { favicon.href = '/favicon.svg'; };
    if (count === 0) favicon.href = '/favicon.svg';
};


export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, profile, refreshProfile } = useAuth();
    const [notifications, setNotifications] = useState<SiteNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [newNotificationCount, setNewNotificationCount] = useState(0);
    
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            setHasNewNotification(false);
            setNewNotificationCount(0);
            updateFavicon(0);
            return;
        }

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(20);
            
            if (data) {
                setNotifications(data as any);
                // We can't access profile.lastNotificationCheck directly here if it's not in the type
                // Assuming it's handled or we just default to showing notifications
            }
            setLoading(false);
        };

        fetchNotifications();

        const channel = supabase.channel('global_notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
                const newNotif = payload.new;
                setNotifications(prev => [newNotif, ...prev]);
                setNewNotificationCount(prev => prev + 1);
                setHasNewNotification(true);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, profile]);

    useEffect(() => {
        updateFavicon(newNotificationCount);
    }, [newNotificationCount]);

    const updateLastChecked = useCallback(async () => {
        if (user) {
            await updateUserProfile(user.uid, { lastNotificationCheck: new Date().toISOString() });
            await refreshProfile();
            setHasNewNotification(false);
            setNewNotificationCount(0);
        }
    }, [user, refreshProfile]);

    const value = {
        notifications,
        loading,
        hasNewNotification,
        newNotificationCount,
        updateLastChecked
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}