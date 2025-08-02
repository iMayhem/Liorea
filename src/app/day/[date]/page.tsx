// src/app/day/[date]/page.tsx
'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {format, parseISO, isValid} from 'date-fns';
import {Dashboard} from '@/components/dashboard';
import {generateTimeTableForDate} from '@/lib/data';
import {AppHeader} from '@/components/header';
import {useAuth} from '@/hooks/use-auth';
import {Skeleton} from '@/components/ui/skeleton';

export default function DayTrackerPage({params}: {params: {date: string}}) {
  const {user, loading: authLoading} = useAuth();
  const router = useRouter();
  const { date: dateString } = params;

  // We'll use a state to manage the validity and parsed date to avoid issues during rendering.
  const [isValidDate, setIsValidDate] = React.useState<boolean | null>(null);
  const [parsedDate, setParsedDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    // Access params.date only on the client-side within useEffect.
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const d = parseISO(dateString);
      if (isValid(d)) {
        setParsedDate(d);
        setIsValidDate(true);
        return;
      }
    }
    setIsValidDate(false);
  }, [dateString]); 

  if (authLoading || isValidDate === null) {
    // Render a loading state or nothing while we validate the date on the client.
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (isValidDate === false || !parsedDate) {
    return (
      <div>
        <AppHeader />
        <main className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">Invalid Date</h1>
          <p className="text-muted-foreground">
            The date provided is not valid or has an incorrect format
            (YYYY-MM-DD).
          </p>
        </main>
      </div>
    );
  }

  const formattedDate = format(parsedDate, 'MMMM d, yyyy');

  const timetable = generateTimeTableForDate(formattedDate);

  if (!user) {
    // This will be captured by the loading state mostly, but as a fallback
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
         </main>
      </div>
    );
  }


  return (
    <Dashboard
      username={user.username}
      date={formattedDate}
      timetable={timetable}
    />
  );
}
