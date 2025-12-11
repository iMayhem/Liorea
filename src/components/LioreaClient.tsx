"use client";

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBackground } from '@/context/BackgroundContext';
import { usePresence } from '@/context/PresenceContext';

// Layout
import Header from '@/components/layout/Header';
import PresencePanel from '@/components/study/PresencePanel';
import WelcomePanel from '@/components/WelcomePanel';
import { Skeleton } from '@/components/ui/skeleton';

// New Feature Widgets
import StudyCalendar from '@/features/widgets/StudyCalendar';
import ExamCountdown from '@/features/widgets/ExamCountdown';
import StatusInput from '@/features/widgets/StatusInput';

export default function LioreaClient() {
  const { isLoading: isBgLoading } = useBackground();
  const { communityUsers, username } = usePresence(); 
  const router = useRouter();
  
  // Dates
  const nextYear = new Date().getFullYear() + 1;
  const jeeDate = useMemo(() => new Date(`${nextYear}-01-24T09:00:00`), [nextYear]);
  const neetDate = useMemo(() => new Date(`${nextYear}-05-05T14:00:00`), [nextYear]);

  // Auth Redirect
  useEffect(() => {
    if (!isBgLoading && !username) {
        router.push('/');
    }
  }, [isBgLoading, username, router]);

  if (isBgLoading || !username) {
    return <Skeleton className="h-screen w-screen bg-black" />;
  }

  return (
    <>
      <Header />

      <main className="relative min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
          
          {/* LEFT: Community Panel */}
          <div className="hidden md:block md:col-span-1 h-full">
            <PresencePanel users={communityUsers} />
          </div>

          {/* CENTER: Main Dashboard */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center gap-8 pt-10">
            <WelcomePanel />
            
            <div className="w-full max-w-sm space-y-6">
                <StatusInput />
                <StudyCalendar />
            </div>
          </div>
          
           {/* RIGHT: Countdowns */}
          <div className="hidden md:flex flex-col gap-4 md:col-span-1">
            <ExamCountdown examName="JEE Main" targetDate={jeeDate} />
            <ExamCountdown examName="NEET UG" targetDate={neetDate} />
          </div>

        </div>
      </main>
    </>
  );
}