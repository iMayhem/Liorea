
"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';
import { usePresence } from '@/context/PresenceContext';
import { ChatProvider } from '@/context/ChatContext';
import ChatPanel from '@/components/chat/ChatPanel';
import StudyGrid from '@/components/study/StudyGrid';
import { motion } from 'framer-motion';

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};


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
          className="flex flex-col items-center gap-6 text-white"
        >
            <motion.div
                className="flex justify-around items-center w-16 h-8"
                variants={loadingContainerVariants}
                initial="start"
                animate="end"
            >
                <motion.span
                    className="block w-3 h-3 bg-accent rounded-full"
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                />
                <motion.span
                    className="block w-3 h-3 bg-accent rounded-full"
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                />
                <motion.span
                    className="block w-3 h-3 bg-accent rounded-full"
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                />
            </motion.div>
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
