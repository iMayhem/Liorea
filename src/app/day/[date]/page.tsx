// src/app/day/[date]/page.tsx
'use client';

import {Dashboard} from '@/components/dashboard';
import {generateTimeTableForDate} from '@/lib/data';
import {format, parseISO, isValid} from 'date-fns';
import { AppHeader } from '@/components/header';
import * as React from 'react';

export default function DayTrackerPage({params}: {params: {date: string}}) {
  // We'll use a state to manage the validity and parsed date to avoid issues during rendering.
  const [isValidDate, setIsValidDate] = React.useState<boolean | null>(null);
  const [parsedDate, setParsedDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Access params.date only on the client-side within useEffect.
    const { date: dateString } = params;
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const d = parseISO(dateString);
      if (isValid(d)) {
        setParsedDate(d);
        setIsValidDate(true);
        return;
      }
    }
    setIsValidDate(false);
  }, [params]); // Depend on the entire params object


  if (isValidDate === null) {
    // Render a loading state or nothing while we validate the date on the client.
    return (
      <div>
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
        </main>
      </div>
    )
  }

  if (isValidDate === false || !parsedDate) {
     return (
       <div>
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">Invalid Date</h1>
          <p className="text-muted-foreground">The date provided is not valid or has an incorrect format (YYYY-MM-DD).</p>
        </main>
      </div>
    )
  }

  const formattedDate = format(parsedDate, 'MMMM d, yyyy');

  const timetable = generateTimeTableForDate(formattedDate);
  
  return (
    <Dashboard
      date={formattedDate}
      timetable={timetable}
    />
  );
}
