// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { CountdownTimer } from '@/components/countdown-timer';
import { TestCountdownTimer } from '@/components/test-countdown-timer';
import { testSchedule } from '@/lib/data';
import { motion } from 'framer-motion';

// Dynamically import the Calendar to ensure it only renders on the client
const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => <div className="h-[298px] w-full rounded-md bg-muted animate-pulse" />,
});


export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const neet2026ExamDate = '2026-05-03T00:00:00';

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <motion.main
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: 20}}
        transition={{duration: 0.5}}
        className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-heading">Welcome, {user.username}!</h1>
          <p className="text-muted-foreground mt-2">
            Select a date to see the schedule and track your progress.
          </p>
        </div>
        <div className="max-w-md w-full mx-auto mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
         <CountdownTimer targetDate={neet2026ExamDate} />
         <TestCountdownTimer tests={testSchedule} />
        </div>
        <Card className="w-full max-w-md shadow-lg rounded-lg border-border/50 mx-auto bg-card">
          <CardContent className="flex justify-center p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md"
              fromDate={new Date('2025-07-01')}
              toDate={new Date('2026-05-05')}
              defaultMonth={new Date('2025-07-01')}
            />
          </CardContent>
        </Card>
      </motion.main>
      <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
        <p>Built to help you succeed.</p>
      </footer>
    </div>
  );
}
