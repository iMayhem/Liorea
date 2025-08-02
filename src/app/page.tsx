// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dynamically import the Calendar to ensure it only renders on the client
const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => <div className="h-[298px] w-full rounded-md bg-muted animate-pulse" />,
});


export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <AppLogo />
              <span className="font-bold">NEET Trackr</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 items-center justify-center p-4 text-center md:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-sans">NEET Trackr</h1>
          <p className="text-muted-foreground mt-2">
            Select a date to see the schedule and track your progress.
          </p>
        </div>
        <Card className="w-full max-w-md shadow-lg rounded-lg border-border/50 mx-auto">
          <CardContent className="flex justify-center p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md"
              fromDate={new Date('2025-08-03')}
              toDate={new Date('2026-05-05')}
              defaultMonth={new Date('2025-08-01')}
            />
          </CardContent>
        </Card>
      </main>
      <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
        <p>Built to help you succeed.</p>
      </footer>
    </div>
  );
}
