// src/app/day/[date]/page.tsx
'use client';

import {Dashboard} from '@/components/dashboard';
import {generateTimeTableForDate, generateInitialProgressForDate} from '@/lib/data';
import {format, parseISO} from 'date-fns';

export default function DayTrackerPage({params}: {params: {date: string}}) {
  const selectedDate = parseISO(params.date);
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
