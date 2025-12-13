"use client";

import React, { Suspense } from 'react';
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
import { SettingsProvider } from '@/context/SettingsContext';
import GlobalUserContextMenu from '@/components/layout/GlobalUserContextMenu';

export function Providers({ children }: { children: React.ReactNode }) {
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
                            <NotificationProvider>
                                <UserContextMenuProvider>
                                    {children}
                                    <MobileMessage />
                                    <GlobalUserContextMenu />
                                </UserContextMenuProvider>
                            </NotificationProvider>
                        </PresenceProvider>
                    </FocusProvider>
                </SettingsProvider>
            </BackgroundProvider>
            <Toaster />
        </>
    );
}
