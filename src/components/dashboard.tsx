'use client';

import React, {useState, useEffect} from 'react';
import type {TimeTableData, UserProgress, CustomTimetable} from '@/lib/types';
import {TimeTableView} from '@/components/timetable-view';
import {AppHeader} from '@/components/header';
import {getProgressForUser, updateTask, updateScore} from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

interface DashboardProps {
  username: string;
  date: string;
  timetable: TimeTableData;
  userTimetable: CustomTimetable | null;
  showHeader?: boolean;
}

export function Dashboard({username, date, timetable, userTimetable, showHeader = true}: DashboardProps) {
  const {user} = useAuth();
  const [myProgress, setMyProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || !date) return;
    
    setLoading(true);
    setMyProgress(null); 

    const fetchData = async () => {
        const progress = await getProgressForUser(username, date, timetable);
        setMyProgress(progress);
        setLoading(false);
    }
    fetchData();

    // Realtime Subscription for progress updates
    const docId = `${user.uid}-${date}`;
    const channel = supabase.channel(`progress:${docId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'progress', filter: `id=eq.${docId}` }, (payload: any) => {
            if(payload.new) setMyProgress(payload.new.data);
        })
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, user, timetable, username]);

  const handleTaskToggle = async (day: string, subject: string, task: string, isCompleted: boolean) => {
      setMyProgress(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [day]: {
            ...prev[day],
            [subject]: {
              ...prev[day]?.[subject],
              [task]: isCompleted,
            },
          },
        };
      });
      await updateTask(username, day, subject, task, isCompleted);
  };

  const handleScoreSave = async (day: string, subject: string, score: number) => {
    setMyProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [subject]: {
            ...prev[day]?.[subject],
            score: score,
          },
        },
      };
    });
    await updateScore(username, day, subject, score);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <AppHeader />}
      <motion.main
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        className="flex-1 container mx-auto p-4 md:p-6 lg:p-8"
      >
         {loading ? (
             <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
         ) : (
            <div className="grid gap-6 mt-4">
              <TimeTableView
                day={date}
                subjects={timetable[date] || []}
                progress={myProgress!}
                onTaskToggle={handleTaskToggle}
                onScoreSave={handleScoreSave}
                isReadOnly={false}
                userTimetable={userTimetable}
              />
            </div>
         )}
      </motion.main>
    </div>
  );
}