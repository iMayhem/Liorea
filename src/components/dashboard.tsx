// src/components/dashboard.tsx
'use client';

import React, {useState, useEffect} from 'react';
import type {TimeTableData, UserProgress} from '@/lib/types';
import {TimeTableView} from '@/components/timetable-view';
import {AppHeader} from '@/components/header';
import {getProgressForUser, updateTask, updateScore} from '@/lib/firestore';
import {db} from '@/lib/firebase';
import {doc, onSnapshot} from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { getDocId } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

interface DashboardProps {
  username: string;
  date: string;
  timetable: TimeTableData;
}

export function Dashboard({username, date, timetable}: DashboardProps) {
  const {user} = useAuth();
  const [myProgress, setMyProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user || !date) return;
    
    setLoading(true);
    // Setting progress to null ensures we show a loading state for the new date
    setMyProgress(null); 

    const docId = getDocId(user.username, date);
    const docRef = doc(db, 'progress', docId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setMyProgress(snapshot.data() as UserProgress);
      } else {
        // If no data exists, create it based on the timetable for the specific date.
        // Check if timetable has data for the date to avoid errors.
        if (timetable && timetable[date]) {
          const initialProgress = {[date]: timetable[date]};
          getProgressForUser(user.username, date, initialProgress).then(setMyProgress);
        } else {
            // Handle case where timetable for date is not available
             setMyProgress({}); // Set to empty or some default state
        }
      }
       setLoading(false); 
    }, (error) => {
        // Handle snapshot errors
        console.error("Error fetching progress:", error);
        setLoading(false);
    });


    // Cleanup subscription on component unmount or when date/user changes
    return () => {
      unsubscribe();
    };
  }, [date, user, timetable]);

  const handleTaskToggle = async (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => {
      // Optimistic update
      setMyProgress(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [day]: {
            ...prev[day],
            [subject]: {
              ...prev[day][subject],
              [task]: isCompleted,
            },
          },
        };
      });
      try {
        await updateTask(username, day, subject, task, isCompleted);
      } catch (error) {
          console.error("Failed to update task:", error);
          // Here you might want to revert the optimistic update and show a toast notification
      }
  };

  const handleScoreSave = async (
    day: string,
    subject: string,
    score: number
  ) => {
    // Optimistic update
    setMyProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [subject]: {
            ...prev[day][subject],
            score: score,
          },
        },
      };
    });
    try {
      await updateScore(username, day, subject, score);
    } catch (error) {
      console.error("Failed to save score:", error);
       // Revert and show error
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <motion.main
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5}}
        className="flex-1 container mx-auto p-4 md:p-6 lg:p-8"
      >
         {loading ? (
             <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
         ) : (
            <DashboardContent
              progress={myProgress}
              timetable={timetable}
              date={date}
              handleTaskToggle={handleTaskToggle}
              handleScoreSave={handleScoreSave}
            />
         )}
      </motion.main>
    </div>
  );
}

interface DashboardContentProps {
  progress: UserProgress | null;
  timetable: TimeTableData;
  date: string;
  handleTaskToggle: (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => void;
  handleScoreSave: (day: string, subject: string, score: number) => void;
}

function DashboardContent({
  progress,
  timetable,
  date,
  handleTaskToggle,
  handleScoreSave,
}: DashboardContentProps) {
  if (!progress) {
    return  <div className="space-y-4 mt-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>;
  }
  return (
    <div className="grid gap-6 mt-4">
      <TimeTableView
        day={date}
        subjects={timetable[date] || []}
        progress={progress}
        onTaskToggle={handleTaskToggle}
        onScoreSave={handleScoreSave}
        isReadOnly={false}
      />
    </div>
  );
}
