"use client";

import React, { useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/context/NotificationContext';
import { BackgroundProvider } from '@/context/BackgroundContext';
import { PresenceProvider } from '@/features/study';
import BackgroundDisplay from '@/components/layout/BackgroundDisplay';
import { FocusProvider } from '@/context/FocusContext';
import FocusOverlay from '@/components/layout/FocusOverlay';
import { NavigationEvents } from '@/components/layout/NavigationEvents';
import MobileMessage from '@/components/layout/MobileMessage';
import { UserContextMenuProvider } from '@/context/UserContextMenuContext';
import GlobalUserContextMenu from '@/components/layout/GlobalUserContextMenu';
import { GamificationProvider } from '@/features/gamification/context/GamificationContext';
import { LevelUpModal } from '@/features/gamification/components/LevelUpModal';

export function Providers({ children }: { children: React.ReactNode }) {
    // DISABLE GLOBAL RIGHT CLICK
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    return (
        <>
            <Suspense>
                <NavigationEvents />
            </Suspense>
            <BackgroundProvider>
                <BackgroundDisplay />
                <FocusProvider>
                    <FocusOverlay />
                    <PresenceProvider>
                        <GamificationProvider>
                            <LevelUpModal />
                            <NotificationProvider>
                                <UserContextMenuProvider>
                                    {children}
                                    <MobileMessage />
                                    <GlobalUserContextMenu />
                                </UserContextMenuProvider>
                            </NotificationProvider>
                        </GamificationProvider>
                    </PresenceProvider>
                </FocusProvider>
            </BackgroundProvider>
            <Toaster />
        </>
    );
}
