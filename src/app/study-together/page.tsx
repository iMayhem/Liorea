
"use client";

import Header from '@/components/layout/Header';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';
import StudyGrid from '@/components/study/StudyGrid';

export default function StudyTogetherPage() {
  const { onlineUsers } = usePresence();
  return (
    <ChatProvider>
      <div className="bg-transparent text-foreground">
        <Header />
        <main className="container mx-auto h-screen pt-16 pb-16 px-4 flex items-center">
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <StudyGrid users={onlineUsers} />
            <ChatPanel />
          </div>
        </main>
        <ClientOnly>
          <ControlPanel />
        </ClientOnly>
      </div>
    </ChatProvider>
  );
}
