// src/app/study/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold font-heading">Study Space</h1>
            <p className="text-muted-foreground mt-2">
              Focus on your tasks with the Pomodoro timer.
            </p>
          </div>
          <PomodoroTimer />
        </motion.div>
      </main>
    </div>
  );
}
