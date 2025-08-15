// src/components/app-body.tsx
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { StudyRoomProvider } from '@/hooks/use-study-room';
import { PersistentAmbientSound } from '@/components/persistent-ambient-sound';
import { LockModeOverlay } from '@/components/lock-mode-overlay';
import { Toaster } from '@/components/ui/toaster';
import { useBackground, BackgroundProvider } from '@/hooks/use-background';
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

// Create a new component to consume the background context
function AppBodyContent({ children }: { children: React.ReactNode }) {
  const { backgroundImage } = useBackground();
  const privateMessageAudioRef = React.useRef<HTMLAudioElement>(null);
  
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
          <StudyRoomProvider privateMessageAudioRef={privateMessageAudioRef}>
              <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">
                      {children}
                  </div>
              </div>
              <PersistentAmbientSound />
              <LockModeOverlay />
              <PrivateChatOverlay audioRef={privateMessageAudioRef} />
              <LeaderboardOverlay />
          </StudyRoomProvider>
        </AuthProvider>
          <Toaster />
      </ThemeProvider>
    </div>
  );
}


export function AppBody({ children }: { children: React.ReactNode }) {
  return (
    <BackgroundProvider>
      <AppBodyContent>{children}</AppBodyContent>
    </BackgroundProvider>
  )
}
