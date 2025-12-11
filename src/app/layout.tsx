"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/context/NotificationContext';
import { BackgroundProvider } from '@/context/BackgroundContext';
import { PresenceProvider } from '@/features/study';
import BackgroundDisplay from '@/components/layout/BackgroundDisplay';
import { FocusProvider } from '@/context/FocusContext';
import FocusOverlay from '@/components/layout/FocusOverlay';
import { NavigationEvents } from '@/components/layout/NavigationEvents';
import { Suspense, useEffect } from 'react';
import MobileMessage from '@/components/layout/MobileMessage';
import { UserContextMenuProvider } from '@/context/UserContextMenuContext';
import GlobalUserContextMenu from '@/components/layout/GlobalUserContextMenu';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // DISABLE GLOBAL RIGHT CLICK
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <html lang="en" className="theme-blue">
      <head>
        <link rel="icon" href="https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/favicon/favicon.svg" />
        <title>Liorea</title>
        <meta name="description" content="Your personalized virtual workspace." />
      </head>
      <body className="font-body antialiased h-screen w-screen overflow-hidden select-none">
        <Suspense>
          <NavigationEvents />
        </Suspense>
        <BackgroundProvider>
          <BackgroundDisplay />
          <FocusProvider>
            <FocusOverlay />
            <PresenceProvider>
              <NotificationProvider>
                <UserContextMenuProvider>
                  <div className="hidden md:block h-full w-full">
                    {children}
                  </div>
                  <MobileMessage />
                  <GlobalUserContextMenu />
                </UserContextMenuProvider>
              </NotificationProvider>
            </PresenceProvider>
          </FocusProvider>
        </BackgroundProvider>
        <Toaster />
      </body>
    </html>
  );
}