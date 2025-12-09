
"use client";

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';
import StudyGrid from '@/components/study/StudyGrid';

export default function StudyTogetherPage() {
  const { onlineUsers, joinSession, leaveSession } = usePresence();

  useEffect(() => {
    // Join the session when the component mounts
    joinSession();

    // Leave the session when the component unmounts
    return () => {
      leaveSession();
    };
  }, [joinSession, leaveSession]);

  return (
    <ChatProvider>
      <div className="bg-transparent text-foreground">
        <Header />
        <main className="container mx-auto h-screen pt-16 pb-16 px-4 flex items-center">
          <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 w-full">
               <StudyGrid users={onlineUsers} />
            </div>
            <div className="lg:col-span-2 w-full">
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
