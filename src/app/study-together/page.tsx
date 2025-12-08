"use client";

import Header from '@/components/layout/Header';
import StudyGrid from '@/components/study/StudyGrid';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';
import PomodoroTimer from '@/components/timer/PomodoroTimer';

export default function StudyTogetherPage() {
  const { onlineUsers } = usePresence();
  return (
    <ChatProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto pt-24 pb-12 px-4">
          <div className="flex justify-center mb-8">
            <div className="w-80">
              <PomodoroTimer />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <StudyGrid users={onlineUsers} />
            </div>
            <div className="hidden lg:block">
                <ChatPanel />
            </div>
          </div>
        </main>
        <ClientOnly>
          <ControlPanel leaderboardUsers={onlineUsers} />
        </ClientOnly>
      </div>
    </ChatProvider>
  );
}
