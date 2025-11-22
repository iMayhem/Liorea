'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { StudyRoomProvider } from '@/hooks/use-study-room';
import { PersistentAmbientSound } from '@/components/persistent-ambient-sound';
import { Toaster } from '@/components/ui/toaster';
import { useBackground, BackgroundProvider } from '@/hooks/use-background';
import { LeaderboardOverlay } from './leaderboard-overlay';
import { NotificationProvider } from '@/hooks/use-notifications';
import { Loader2 } from 'lucide-react';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

function AppBodyContent({ children }: { children: React.ReactNode }) {
  const { backgroundImage, isInitialLoading } = useBackground();
  const pathname = usePathname();

  // Check if we are on a public/auth page
  const isAuthPage = pathname === '/login' || pathname === '/set-username';
  
  if (isInitialLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

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
            {/* 
               CRITICAL CHANGE: 
               Only load heavy App Logic (StudyRooms, Notifications, Sounds) 
               if we are NOT on the login page. 
               This isolates the Login page from potential crashes.
            */}
            {!isAuthPage ? (
                <NotificationProvider>
                  <StudyRoomProvider>
                      <div className="relative flex min-h-screen flex-col">
                          <div className="flex-1">
                              {children}
                          </div>
                      </div>
                      <PersistentAmbientSound />
                      <LeaderboardOverlay />
                  </StudyRoomProvider>
                </NotificationProvider>
            ) : (
                // Simple layout for Login/Auth pages
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            )}
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