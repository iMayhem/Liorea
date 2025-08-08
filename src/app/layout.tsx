// src/app/layout.tsx
import type {Metadata} from 'next';
import {Inter, Space_Grotesk} from 'next/font/google';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {AuthProvider} from '@/hooks/use-auth';
import {cn} from '@/lib/utils';
import { StudyRoomProvider } from '@/hooks/use-study-room';
import { PersistentStudyRoomBar } from '@/components/persistent-study-room';
import { PersistentAmbientSound } from '@/components/persistent-ambient-sound';


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
        style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%'}}
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
            </StudyRoomProvider>
        </AuthProvider>
        <Toaster />
        <audio id="join-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fnotification.mp3?alt=media&token=80d446c7-fc85-4fdc-a745-e2bd77a72e97" preload="auto"></audio>
        <audio id="leave-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fnotification.mp3?alt=media&token=80d446c7-fc85-4fdc-a745-e2bd77a72e97" preload="auto"></audio>
        {/* Replace the src with the actual URL to your chat sound file */}
        <audio id="chat-notification-sound" src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Fding.mp3?alt=media&token=c71ed344-e701-4c53-8769-8d938141cadc" preload="auto"></audio>
      </body>
    </html>
  );
}
