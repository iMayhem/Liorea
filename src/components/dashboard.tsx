// src/components/dashboard.tsx
'use client';

import React, {useState, useEffect} from 'react';
import type {TimeTableData, UserProgress} from '@/lib/types';
import {TimeTableView} from '@/components/timetable-view';
import {FeedbackCard} from '@/components/feedback-card';
import {AppHeader} from '@/components/header';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {getProgress, updateTask} from '@/lib/firestore';
import {db} from '@/lib/firebase';
import {doc, onSnapshot} from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

interface DashboardProps {
  date: string;
  timetable: TimeTableData;
}

function getDocId(userId: string, date: string): string {
  return `${userId}-${date.replace(/, /g, '-')}`;
}

export function Dashboard({date, timetable}: DashboardProps) {
  const [user1Progress, setUser1Progress] = useState<UserProgress | null>(null);
  const [user2Progress, setUser2Progress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<string>('user1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialProgress = async () => {
      setLoading(true);
      try {
        const [p1, p2] = await Promise.all([
          getProgress('user1', date, timetable),
          getProgress('user2', date, timetable),
        ]);
        setUser1Progress(p1);
        setUser2Progress(p2);
      } catch(error) {
        console.error("Failed to fetch initial progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProgress();

    const unsubUser1 = onSnapshot(doc(db, 'progress', getDocId('user1', date)), (doc) => {
        if(doc.exists()) setUser1Progress(doc.data() as UserProgress);
    });
    const unsubUser2 = onSnapshot(doc(db, 'progress', getDocId('user2', date)), (doc) => {
        if(doc.exists()) setUser2Progress(doc.data() as UserProgress);
    });

    return () => {
      unsubUser1();
      unsubUser2();
    };
  }, [date, timetable]);

  const handleTaskToggle = async (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => {
    const userId = activeTab;
    // Optimistic update
    const progressUpdater = userId === 'user1' ? setUser1Progress : setUser2Progress;
     progressUpdater(prev => {
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
    }});

    try {
      await updateTask(userId, day, subject, task, isCompleted);
    } catch (error) {
        console.error("Failed to update task:", error);
        // Here you might want to revert the optimistic update and show a toast notification
    }
  };
  
  if (loading || !user1Progress || !user2Progress) {
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
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user1">My Progress</TabsTrigger>
            <TabsTrigger value="user2">Partner's Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="user1">
            <DashboardContent
              progress={user1Progress}
              timetable={timetable}
              date={date}
              handleTaskToggle={handleTaskToggle}
            />
          </TabsContent>
          <TabsContent value="user2">
             <DashboardContent
              progress={user2Progress}
              timetable={timetable}
              date={date}
              handleTaskToggle={handleTaskToggle}
            />
          </TabsContent>
        </Tabs>
      </main>
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
}

function DashboardContent({
  progress,
  timetable,
  date,
  handleTaskToggle,
}: DashboardContentProps) {
  if (!progress) {
    return null;
  }
  return (
    <div className="grid gap-6 mt-4">
      <FeedbackCard
        key={date}
        progress={progress}
        timetable={timetable}
      />
      <TimeTableView
        day={date}
        subjects={timetable[date]}
        progress={progress}
        onTaskToggle={handleTaskToggle}
      />
    </div>
  );
}
