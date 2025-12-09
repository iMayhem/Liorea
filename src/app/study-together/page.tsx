
"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';
import StudyGrid from '@/components/study/StudyGrid';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyTogetherPage() {
  const { onlineUsers, joinSession, leaveSession } = usePresence();
  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    // Start the session
    joinSession();

    // Show a "joining" state for a short period for better UX
    const timer = setTimeout(() => {
      setIsJoining(false);
    }, 1500); // 1.5 second transition

    // On component unmount, stop counting time and clear timer
    return () => {
      clearTimeout(timer);
      leaveSession();
    };
  }, [joinSession, leaveSession]);

  if (isJoining) {
    return (
      <div className="bg-transparent text-foreground h-screen w-screen flex flex-col items-center justify-center">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-white"
        >
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
          <h1 className="text-2xl font-semibold">Joining study room...</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="bg-transparent text-foreground">
        <Header />
        <main className="container mx-auto h-screen pt-16 pb-16 px-4 flex items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start"
          >
            <div className="lg:col-span-3 w-full">
               <StudyGrid users={onlineUsers} />
            </div>
            <div className="lg:col-span-2 w-full">
              <ChatPanel />
            </div>
          </motion.div>
        </main>
        <ClientOnly>
          <ControlPanel />
        </ClientOnly>
      </div>
    </ChatProvider>
  );
}
