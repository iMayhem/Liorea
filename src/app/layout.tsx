// src/app/layout.tsx
import type {Metadata} from 'next';
import {Inter, Space_Grotesk} from 'next/font/google';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {AuthProvider} from '@/hooks/use-auth';
import {cn} from '@/lib/utils';
import { StudyRoomProvider } from '@/hooks/use-study-room';
import { PersistentStudyRoomBar } from '@/components/persistent-study-room';


const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Neet Tracker',
  description: 'Track your NEET preparation with your partner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <AuthProvider>
            <StudyRoomProvider>
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <PersistentStudyRoomBar />
                </div>
            </StudyRoomProvider>
        </AuthProvider>
        <Toaster />
        <audio id="join-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/sounds%2Fnotification.mp3?alt=media" preload="auto"></audio>
        <audio id="leave-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/sounds%2Fnotification.mp3?alt=media" preload="auto"></audio>
      </body>
    </html>
  );
}
