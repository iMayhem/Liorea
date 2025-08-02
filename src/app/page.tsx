// src/app/page.tsx
'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {format} from 'date-fns';
import {Calendar} from '@/components/ui/calendar';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import { AppLogo } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setDate(new Date('2025-08-03T00:00:00'));
  }, []);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="flex flex-col items-center text-center mb-8">
        <AppLogo />
        <h1 className="text-4xl font-bold font-sans mt-2">NEET Trackr</h1>
        <p className="text-muted-foreground">Select a date to see the schedule and track your progress.</p>
      </header>
      <main>
        {isClient ? (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
              <CardDescription>Pick a day to view your study schedule.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
                fromDate={new Date('2025-08-03')}
                toDate={new Date('2026-05-05')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="w-[350px] h-[360px] bg-muted rounded-lg animate-pulse" />
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Built to help you succeed.</p>
      </footer>
    </div>
  );
}
