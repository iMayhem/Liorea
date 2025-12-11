"use client";

import Header from '@/shared/layout/Header';
import PresencePanel from '@/features/study/components/PresencePanel';
import ExamCountdown from '@/features/timer/components/ExamCountdown';
import { usePresence } from '@/shared/context/PresenceContext';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Terminal } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { useBackground } from '@/shared/context/BackgroundContext';
import StudyCalendar from '@/features/study/components/StudyCalendar';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/shared/ui/skeleton';
import WelcomePanel from './WelcomePanel';
import StatusPanel from '@/features/study/components/StatusPanel';

export default function LioreaClient() {
  const { error, isLoading: isBackgroundLoading } = useBackground();
  const { communityUsers, username } = usePresence(); // Changed onlineUsers to communityUsers
  const router = useRouter();
  const nextYear = new Date().getFullYear() + 1;
  
  const jeeTargetDate = useMemo(() => new Date(`${nextYear}-01-24T09:00:00`), [nextYear]);
  const neetTargetDate = useMemo(() => new Date(`${nextYear}-05-05T14:00:00`), [nextYear]);

  useEffect(() => {
    // If the background is done loading and we find there's no user, redirect.
    if (!isBackgroundLoading && !username) {
        router.push('/');
    }
  }, [isBackgroundLoading, username, router]);

  // Show a loading skeleton while we're waiting for user/background data
  if (isBackgroundLoading || !username) {
    return <Skeleton className="h-screen w-screen bg-transparent" />;
  }

  return (
    <>
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

      <main className="relative z-1 min-h-screen flex items-center justify-center text-white p-4">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Column */}
          <div className="hidden md:flex justify-start md:col-span-1 lg:col-span-1">
            <PresencePanel users={communityUsers} />
          </div>

          {/* Center Column */}
          <div className="flex flex-col items-center justify-center gap-8 md:col-span-2 lg:col-span-3 w-full -mt-16">
            <WelcomePanel />
            <div className="flex flex-col gap-4 w-full max-w-sm">
                <StatusPanel />
                <StudyCalendar />
            </div>
          </div>
          
           {/* Right Column */}
          <div className="hidden md:flex justify-end md:col-span-1 lg:col-span-1">
            <div className="space-y-4">
                <ExamCountdown examName="JEE Main" targetDate={jeeTargetDate} />
                <ExamCountdown examName="NEET UG" targetDate={neetTargetDate} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}