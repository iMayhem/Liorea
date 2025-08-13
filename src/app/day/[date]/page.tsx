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
import type { UserProfile, CustomTimetable } from '@/lib/types';
import { getUserTimetable } from '@/lib/firestore';


export default function DayTrackerPage({params}: {params: {date: string}}) {
  const {user, loading: authLoading, profile, loadingProfile} = useAuth();
  const router = useRouter();
  
  const routeParams = React.use(params as any);
  const { date: dateString } = routeParams;

  const [parsedDate, setParsedDate] = React.useState<Date | null>(null);
  const [dateIsValid, setDateIsValid] = React.useState<boolean | null>(null);
  const [userTimetable, setUserTimetable] = React.useState<CustomTimetable | null>(null);
  const [loadingTimetable, setLoadingTimetable] = React.useState(true);

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
    if (authLoading || loadingProfile) return;
    if (!user) {
      router.push('/login');
    } else if (!profile?.username) {
      router.push('/set-username');
    }
  }, [user, authLoading, profile, loadingProfile, router]);
  
  React.useEffect(() => {
    if (!user) return;
    setLoadingTimetable(true);
    getUserTimetable(user.uid)
      .then(setUserTimetable)
      .finally(() => setLoadingTimetable(false));
  }, [user]);

  const formattedDate = React.useMemo(() => {
    return parsedDate ? format(parsedDate, 'MMMM d, yyyy') : '';
  }, [parsedDate]);

  const timetable = React.useMemo(() => {
      if (!formattedDate || !profile) return {};
      // Pass the user's entire custom timetable object
      return generateTimeTableForDate(formattedDate, userTimetable);
  }, [formattedDate, profile, userTimetable]);


  if (authLoading || loadingProfile || loadingTimetable || !user || !profile || dateIsValid === null) {
    // Render a loading state or nothing while we validate the date on the client.
    return (
      <div className="flex flex-col min-h-screen">
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
      username={profile.username!}
      date={formattedDate}
      timetable={timetable}
      userTimetable={userTimetable}
    />
  );
}
