// src/app/day/[date]/page.tsx
'use client';

import {Dashboard} from '@/components/dashboard';
import {generateTimeTableForDate, generateInitialProgressForDate} from '@/lib/data';
import {format, parseISO, isValid} from 'date-fns';
import { AppHeader } from '@/components/header';

export default function DayTrackerPage({params}: {params: {date: string}}) {
  // Although the warning suggests using React.use(), that's for Server Components.
  // In a Client Component, accessing params directly is still the standard way.
  // The warning might be a bit misleading in this context.
  // We'll proceed by validating the date from params.
  const { date } = params;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
     return (
       <div>
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">Invalid Date Format</h1>
          <p className="text-muted-foreground">The date in the URL is not in the correct format (YYYY-MM-DD).</p>
        </main>
      </div>
    )
  }

  const selectedDate = parseISO(date);

  if (!isValid(selectedDate)) {
    return (
       <div>
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">Invalid Date</h1>
          <p className="text-muted-foreground">The date provided is not valid. Please go back to the calendar and select a valid date.</p>
        </main>
      </div>
    )
  }

  const formattedDate = format(selectedDate, 'MMMM d, yyyy');

  const timetable = generateTimeTableForDate(formattedDate);
  const user1Progress = generateInitialProgressForDate(timetable);
  const user2Progress = generateInitialProgressForDate(timetable);

  return (
    <Dashboard
      date={formattedDate}
      timetable={timetable}
      user1Progress={user1Progress}
      user2Progress={user2Progress}
    />
  );
}
