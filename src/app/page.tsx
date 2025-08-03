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
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  React.useEffect(() => {
    // This effect runs on the client, so `new Date()` will be the user's current date.
    setCurrentMonth(new Date());
  }, []);

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
        
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="w-full max-w-xs">
                 <CountdownTimer targetDate={neet2026ExamDate} />
            </div>

            <Card className="w-full max-w-md shadow-lg rounded-lg border-border/50 mx-auto bg-card order-first lg:order-none">
                <CardContent className="flex justify-center p-0">
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="rounded-md"
                    fromDate={new Date('2025-07-01')}
                    toDate={new Date('2026-05-05')}
                    defaultMonth={currentMonth}
                    />
                </CardContent>
            </Card>

            <div className="w-full max-w-xs">
                <TestCountdownTimer tests={testSchedule} />
            </div>
        </div>

      </motion.main>
      <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
        <p>specially built for achiever online batch</p>
      </footer>
    </div>
  );
}
