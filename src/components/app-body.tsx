// src/components/app-body.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { StudyRoomProvider } from '@/hooks/use-study-room';
import { PersistentStudyRoomBar } from '@/components/persistent-study-room';
import { PersistentAmbientSound } from '@/components/persistent-ambient-sound';
import { LockModeOverlay } from '@/components/lock-mode-overlay';
import { Toaster } from '@/components/ui/toaster';
import { useBackground } from '@/hooks/use-background';
import { PrivateChatOverlay } from './private-chat-overlay';
import { LeaderboardOverlay } from './leaderboard-overlay';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export function AppBody({ children }: { children: React.ReactNode }) {
  const { backgroundImage } = useBackground();
  return (
      <div
        className={cn(
          'min-h-screen font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            themes={["dark", "theme-blue", "theme-zinc"]}
        >
          <AuthProvider>
            <StudyRoomProvider>
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <PersistentStudyRoomBar />
                </div>
                <PersistentAmbientSound />
                <LockModeOverlay />
                <PrivateChatOverlay />
                <LeaderboardOverlay />
            </StudyRoomProvider>
          </AuthProvider>
            <Toaster />
            <audio id="join-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fnotification.mp3?alt=media&token=80d446c7-fc85-4fdc-a745-e2bd77a72e97" preload="auto"></audio>
            <audio id="leave-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fnotification.mp3?alt=media&token=80d446c7-fc85-4fdc-a745-e2bd77a72e97" preload="auto"></audio>
            {/* Replace the src with the actual URL to your chat sound file */}
            <audio id="chat-notification-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fding.mp3?alt=media&token=c71ed344-e701-4c53-8769-8d938141cadc" preload="auto"></audio>
        </ThemeProvider>
      </div>
  )
}
