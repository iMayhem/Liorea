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
import {motion} from 'framer-motion';

export default function DayTrackerPage({params}: {params: {date: string}}) {
  const {user, loading: authLoading} = useAuth();
  const router = useRouter();
  
  // The `use` hook is the recommended way to access params in a client component.
  const routeParams = React.use(params as any);
  const { date: dateString } = routeParams;

  // We'll use a state to manage the validity and parsed date to avoid issues during rendering.
  const [parsedDate, setParsedDate] = React.useState<Date | null>(null);
  const [dateIsValid, setDateIsValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const d = parseISO(dateString);
      if (isValid(d)) {
        setParsedDate(d);
        setDateIsValid(true);
        return;
      }
    }
    setDateIsValid(false);
  }, [dateString]);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const formattedDate = React.useMemo(() => {
    return parsedDate ? format(parsedDate, 'MMMM d, yyyy') : '';
  }, [parsedDate]);

  const timetable = React.useMemo(() => {
      if (!formattedDate) return {};
      return generateTimeTableForDate(formattedDate);
  }, [formattedDate]);


  if (authLoading || !user || dateIsValid === null) {
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
  
  if (!dateIsValid) {
    return (
      <div>
        <AppHeader />
        <motion.main
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5}}
          className="container mx-auto p-4 text-center"
        >
          <h1 className="text-2xl font-bold mt-8">Invalid Date</h1>
          <p className="text-muted-foreground">
            The date provided is not valid or has an incorrect format
            (YYYY-MM-DD).
          </p>
        </motion.main>
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
