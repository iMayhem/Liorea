// src/app/page.tsx
'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {format} from 'date-fns';
import {Calendar} from '@/components/ui/calendar';

export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(new Date('2025-08-03T00:00:00'));

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <header style={{padding: '1rem', textAlign: 'center'}}>
        <h1>NEET Trackr</h1>
        <p>Select a date to see the schedule</p>
      </header>
      <main>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          style={{border: '1px solid black', borderRadius: '0.5rem'}}
          // Can be removed if we want to show dates beyond the range
          fromDate={new Date('2025-08-03')}
          toDate={new Date('2026-05-05')}
        />
      </main>
    </div>
  );
}
