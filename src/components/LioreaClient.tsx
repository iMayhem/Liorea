"use client";

import Header from '@/components/layout/Header';
import DigitalClock from '@/components/clock/DigitalClock';
import PomodoroTimer from '@/components/timer/PomodoroTimer';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from './ClientOnly';
import PresencePanel from './study/PresencePanel';
import ExamCountdown from './timer/ExamCountdown';
import { mockUsers } from '@/lib/mock-data';

export default function LioreaClient() {
  const nextYear = new Date().getFullYear() + 1;
  const jeeTargetDate = new Date(`${nextYear}-01-24T09:00:00`);
  const neetTargetDate = new Date(`${nextYear}-05-05T14:00:00`);

  return (
    <>
      <div className="absolute inset-0 bg-background transition-colors duration-1000"></div>
      <Header />

      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-w-xs w-full">
            <PresencePanel users={mockUsers} />
        </div>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-w-xs w-full space-y-4">
            <ExamCountdown examName="JEE Main" targetDate={jeeTargetDate} />
            <ExamCountdown examName="NEET UG" targetDate={neetTargetDate} />
        </div>
      </div>

      <main className="relative z-1 min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-8 text-center">
          <DigitalClock />
          <PomodoroTimer />
        </div>
      </main>
      <ClientOnly>
        <ControlPanel 
          leaderboardUsers={mockUsers} 
        />
      </ClientOnly>
    </>
  );
}
