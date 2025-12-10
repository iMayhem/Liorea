import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/context/NotificationContext';
import { BackgroundProvider } from '@/context/BackgroundContext';
import { PresenceProvider } from '@/context/PresenceContext';
import BackgroundDisplay from '@/components/layout/BackgroundDisplay';
import { FocusProvider } from '@/context/FocusContext';
import FocusOverlay from '@/components/layout/FocusOverlay';
import { NavigationEvents } from '@/components/layout/NavigationEvents';
import { Suspense } from 'react';
import MobileMessage from '@/components/layout/MobileMessage';

export const metadata: Metadata = {
  title: 'Liorea',
  description: 'Your personalized virtual workspace for focus and productivity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-blue">
      <head>
        <link rel="icon" href="https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/favicon/favicon.svg" />
      </head>
      {/* UPDATED: h-screen w-screen overflow-hidden ensures "App" behavior */}
      <body className="font-body antialiased h-screen w-screen overflow-hidden">
        <Suspense>
          <NavigationEvents />
        </Suspense>
        <BackgroundProvider>
          <BackgroundDisplay />
          <FocusProvider>
            <FocusOverlay />
            <PresenceProvider>
              <NotificationProvider>
                <div className="hidden md:block h-full w-full">
                  {children}
                </div>
                <MobileMessage />
              </NotificationProvider>
            </PresenceProvider>
          </FocusProvider>
        </BackgroundProvider>
        <Toaster />
      </body>
    </html>
  );
}