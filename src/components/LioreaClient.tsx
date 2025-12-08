"use client";

import Header from '@/components/layout/Header';
import DigitalClock from '@/components/clock/DigitalClock';
import PomodoroTimer from '@/components/timer/PomodoroTimer';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from './ClientOnly';
import PresencePanel from './study/PresencePanel';
import ExamCountdown from './timer/ExamCountdown';

const mockUsers = [
  { id: 1, name: 'Alex', avatarImageId: 'user-avatar-1', studyTime: 4 * 60 + 25, status: 'online' },
  { id: 2, name: 'Brenda', avatarImageId: 'user-avatar-2', studyTime: 3 * 60 + 50, status: 'online' },
  { id: 3, name: 'Charlie', avatarImageId: 'user-avatar-3', studyTime: 3 * 60 + 15, status: 'offline', lastSeen: '15m ago' },
  { id: 4, name: 'Diana', avatarImageId: 'user-avatar-4', studyTime: 2 * 60 + 30, status: 'online' },
  { id: 5, name: 'Ethan', avatarImageId: 'user-avatar-5', studyTime: 2 * 60 + 5, status: 'offline', lastSeen: '1h ago' },
  { id: 6, name: 'Fiona', avatarImageId: 'user-avatar-6', studyTime: 1 * 60 + 45, status: 'online' },
  { id: 7, name: 'George', avatarImageId: 'user-avatar-7', studyTime: 1 * 60 + 10, status: 'offline', lastSeen: 'yesterday' },
  { id: 8, name: 'Hannah', avatarImageId: 'user-avatar-8', studyTime: 55, status: 'online' },
];

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
