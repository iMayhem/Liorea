// src/app/page.tsx
'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {format} from 'date-fns';
import {Calendar} from '@/components/ui/calendar';

export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(new Date('2025-08-03T00:00:00'));
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="p-4 text-center">
        <h1 className="text-4xl font-bold font-sans">NEET Trackr</h1>
        <p className="text-muted-foreground">Select a date to see the schedule</p>
      </header>
      <main>
        {isClient && (
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            fromDate={new Date('2025-08-03')}
            toDate={new Date('2026-05-05')}
          />
        )}
      </main>
    </div>
  );
}
