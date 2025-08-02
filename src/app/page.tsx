// src/app/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {format} from 'date-fns';
import {Calendar} from '@/components/ui/calendar';
import {Card, CardContent} from '@/components/ui/card';
import { AppLogo } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();
  // Set the initial date to undefined so no date is selected by default.
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-sans">NEET Trackr</h1>
            <p className="text-muted-foreground mt-2">Select a date to see the schedule and track your progress.</p>
        </div>
        {isClient ? (
          <Card className="w-full max-w-md shadow-lg rounded-lg border-border/50">
            <CardContent className="flex justify-center p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md"
                // The first selectable date.
                fromDate={new Date('2025-08-03')}
                toDate={new Date('2026-05-05')}
                // Set the calendar to open to August 2025.
                defaultMonth={new Date('2025-08-01')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="w-[350px] h-[360px] bg-muted rounded-lg animate-pulse" />
        )}
      </main>
      <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
        <p>Built to help you succeed.</p>
      </footer>
    </div>
  );
}
