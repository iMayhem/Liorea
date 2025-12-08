
"use client";

import Header from '@/components/layout/Header';
import DigitalClock from '@/components/clock/DigitalClock';
import PomodoroTimer from '@/components/timer/PomodoroTimer';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from './ClientOnly';
import PresencePanel from './study/PresencePanel';
import ExamCountdown from './timer/ExamCountdown';
import { useBackground } from '@/context/BackgroundContext';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { usePresence } from '@/context/PresenceContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { useMemo } from 'react';

export default function LioreaClient() {
  const { currentBackground, isLoading, error } = useBackground();
  const { onlineUsers } = usePresence();
  const nextYear = new Date().getFullYear() + 1;
  
  const jeeTargetDate = useMemo(() => new Date(`${nextYear}-01-24T09:00:00`), [nextYear]);
  const neetTargetDate = useMemo(() => new Date(`${nextYear}-05-05T14:00:00`), [nextYear]);


  return (
    <>
      <div className="absolute inset-0 transition-all duration-1000">
        {isLoading || !currentBackground ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            key={currentBackground.id}
            src={currentBackground.url}
            alt={currentBackground.name}
            fill
            className="object-cover animate-in fade-in-50"
            priority
          />
        )}
      </div>

      {error && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Background Error</AlertTitle>
                <AlertDescription>
                    Could not load backgrounds from the worker: {error}
                </AlertDescription>
            </Alert>
         </div>
      )}

      <Header />

      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-w-xs w-full">
            <PresencePanel users={onlineUsers} />
        </div>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="space-y-4">
            <ExamCountdown examName="JEE Main" targetDate={jeeTargetDate} />
            <ExamCountdown examName="NEET UG" targetDate={neetTargetDate} />
        </div>
      </div>

      <main className="relative z-1 min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <DigitalClock />
          <div className="w-80">
            <PomodoroTimer />
          </div>
        </div>
      </main>
      <ClientOnly>
        <ControlPanel 
          leaderboardUsers={onlineUsers} 
        />
      </ClientOnly>
    </>
  );
}
