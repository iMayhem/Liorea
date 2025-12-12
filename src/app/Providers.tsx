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
import { GamificationProvider } from '@/features/gamification/context/GamificationContext';
import { UserProfileProvider } from '@/features/gamification/context/UserProfileContext';
import { UserProfileModal } from '@/features/gamification/components/UserProfileModal';
import { LiveTicker } from '@/features/gamification/components/LiveTicker';
import { SettingsProvider } from '@/context/SettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
    // ... useEffect ...

    return (
        <>
            <Suspense>
                <NavigationEvents />
            </Suspense>
            <BackgroundProvider>
                <SettingsProvider>
                    <BackgroundDisplay />
                    <FocusProvider>
                        <FocusOverlay />
                        <PresenceProvider>
                            <GamificationProvider>
                                <LiveTicker />
                                <NotificationProvider>
                                    <UserContextMenuProvider>
                                        <UserProfileProvider>
                                            {children}
                                            <MobileMessage />
                                            <GlobalUserContextMenu />
                                            <UserProfileModal />
                                        </UserProfileProvider>
                                    </UserContextMenuProvider>
                                </NotificationProvider>
                            </GamificationProvider>
                        </PresenceProvider>
                    </FocusProvider>
                </SettingsProvider>
            </BackgroundProvider>
            <Toaster />
        </>
    );
}
