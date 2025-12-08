"use client";

import Header from '@/components/layout/Header';
import StudyGrid from '@/components/study/StudyGrid';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';

export default function StudyTogetherPage() {
  const { onlineUsers } = usePresence();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="grid grid-cols-1">
          <div className="lg:col-span-2">
            <StudyGrid users={onlineUsers} />
          </div>
        </div>
      </main>
      <ClientOnly>
        <ControlPanel leaderboardUsers={onlineUsers} />
      </ClientOnly>
    </div>
  );
}
