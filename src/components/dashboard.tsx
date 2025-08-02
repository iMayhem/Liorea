// src/components/dashboard.tsx
'use client';

import React, {useState, useEffect} from 'react';
import type {TimeTableData, UserProgress} from '@/lib/types';
import {TimeTableView} from '@/components/timetable-view';
import {FeedbackCard} from '@/components/feedback-card';
import {AppHeader} from '@/components/header';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {getProgressForUser, updateTask} from '@/lib/firestore';
import {db} from '@/lib/firebase';
import {doc, onSnapshot} from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { getDocId } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface DashboardProps {
  username: string;
  date: string;
  timetable: TimeTableData;
}

export function Dashboard({username, date, timetable}: DashboardProps) {
  const {user} = useAuth();
  const [partnerUsername, setPartnerUsername] = useState<string>('');
  const [myProgress, setMyProgress] = useState<UserProgress | null>(null);
  const [partnerProgress, setPartnerProgress] = useState<UserProgress | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>('my-progress');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user?.partner) {
      setPartnerUsername(user.partner);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    // Reset progress when date changes
    setMyProgress(null);
    setPartnerProgress(null);

    const unsubMyProgress = onSnapshot(doc(db, 'progress', getDocId(username, date)), (snapshot) => {
      if (snapshot.exists()) {
        setMyProgress(snapshot.data() as UserProgress);
      } else {
        getProgressForUser(username, date, timetable).then(setMyProgress);
      }
    });

    let unsubPartnerProgress = () => {};
    if (partnerUsername) {
      unsubPartnerProgress = onSnapshot(doc(db, 'progress', getDocId(partnerUsername, date)), (snapshot) => {
        if (snapshot.exists()) {
          setPartnerProgress(snapshot.data() as UserProgress);
        } else {
          getProgressForUser(partnerUsername, date, timetable).then(setPartnerProgress);
        }
      });
    }

    return () => {
      unsubMyProgress();
      unsubPartnerProgress();
    };
  }, [date, timetable, username, partnerUsername]);

  useEffect(() => {
    // Set loading to false only when necessary data has been loaded
    if (myProgress && (!partnerUsername || partnerProgress)) {
      setLoading(false);
    }
  }, [myProgress, partnerProgress, partnerUsername]);

  const handleTaskToggle = async (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => {
    // Users can only edit their own progress
    if (activeTab === 'my-progress') {
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
    }
  };
  
  if (loading) {
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
            <TabsTrigger value="my-progress">My Progress</TabsTrigger>
            <TabsTrigger value="partner-progress" disabled={!partnerUsername}>
              {partnerUsername ? `${partnerUsername}'s Progress` : "Partner's Progress"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-progress">
            <DashboardContent
              progress={myProgress}
              timetable={timetable}
              date={date}
              handleTaskToggle={handleTaskToggle}
              isReadOnly={false}
            />
          </TabsContent>
          <TabsContent value="partner-progress">
             {partnerUsername ? (
              <DashboardContent
                progress={partnerProgress}
                timetable={timetable}
                date={date}
                handleTaskToggle={handleTaskToggle}
                isReadOnly={true}
              />
            ) : (
               <div className="text-center p-8">
                  <p>You haven't added a partner yet.</p>
               </div>
            )}
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
  isReadOnly: boolean;
}

function DashboardContent({
  progress,
  timetable,
  date,
  handleTaskToggle,
  isReadOnly,
}: DashboardContentProps) {
  if (!progress) {
    return  <div className="space-y-4 mt-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>;
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
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
