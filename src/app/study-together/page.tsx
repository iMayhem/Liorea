"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomControlBar from '@/features/study/components/BottomControlBar';
import { usePresence } from '@/features/study';
import { ChatProvider, ChatPanel } from '@/features/chat';
import { StudyGrid } from '@/features/study';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

// Loading Animation Variants
const loadingContainerVariants = {
  start: { transition: { staggerChildren: 0.2 } },
  end: { transition: { staggerChildren: 0.2 } },
};

const loadingCircleVariants = {
  start: { y: "0%" },
  end: { y: "100%" },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};

// Content Animation Variants (Smoother entry)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delays the chat panel slightly after the grid
      delayChildren: 0.2    // Waits for layout to settle before showing content
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function StudyTogetherPage() {
  const { studyUsers, joinSession, leaveSession } = usePresence();
  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    // Start the session
    joinSession();

    // Show a "joining" state for a short period for better UX
    const timer = setTimeout(() => {
      setIsJoining(false);
    }, 1500);

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
            <motion.span className="block w-3 h-3 bg-accent rounded-full" variants={loadingCircleVariants} transition={loadingCircleTransition} />
            <motion.span className="block w-3 h-3 bg-accent rounded-full" variants={loadingCircleVariants} transition={loadingCircleTransition} />
            <motion.span className="block w-3 h-3 bg-accent rounded-full" variants={loadingCircleVariants} transition={loadingCircleTransition} />
          </motion.div>
          <h1 className="text-2xl font-semibold">Joining study room...</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="bg-[#313338] min-h-screen text-foreground overflow-hidden font-sans antialiased flex flex-col">
        <Header />

        {/* Content Container - Match Journal's Layout */}
        {/* Journal uses: pt-20 px-4 h-screen flex gap-6 pb-4 */}
        {/* We add extra pb to account for bottom control bar */}
        <main className="container mx-auto pt-20 px-4 h-screen flex gap-6 pb-20">

          {/* LEFT: Study Grid Panel (Solid) - No Header */}
          <div className="w-[45%] flex flex-col bg-[#2B2D31] rounded-2xl border border-[#1F2023] shadow-xl overflow-hidden p-6">
            <StudyGrid users={studyUsers} />
          </div>

          {/* RIGHT: Chat Panel (Solid) */}
          <div className="flex-1 flex flex-col bg-[#2B2D31] rounded-2xl border border-[#1F2023] shadow-xl overflow-hidden">
            <ChatPanel />
          </div>

        </main>

        {/* BOTTOM CONTROL BAR */}
        <BottomControlBar />

      </div>
    </ChatProvider>
  );
}