
"use client";

import Header from '@/components/layout/Header';
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
      <div className="min-h-screen bg-transparent text-foreground">
        <Header />
        <main className="container mx-auto h-screen pt-16 pb-16 px-4 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-7xl">
            <div className="lg:col-span-3 flex items-center justify-center">
                <PomodoroTimer />
            </div>
            <div className="lg:col-span-2">
                <ChatPanel />
            </div>
          </div>
        </main>
        <ClientOnly>
          <ControlPanel />
        </ClientOnly>
      </div>
    </ChatProvider>
  );
}
