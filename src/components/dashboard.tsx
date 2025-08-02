'use client';

import React, {useState} from 'react';
import type {TimeTableData, UserProgress} from '@/lib/types';
import {TimeTableView} from '@/components/timetable-view';
import {FeedbackCard} from '@/components/feedback-card';
import {AppHeader} from '@/components/header';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent} from '@/components/ui/card';

interface DashboardProps {
  date: string;
  timetable: TimeTableData;
  user1Progress: UserProgress;
  user2Progress: UserProgress;
}

export function Dashboard({
  date,
  timetable,
  user1Progress: initialUser1Progress,
  user2Progress: initialUser2Progress,
}: DashboardProps) {
  const [user1Progress, setUser1Progress] =
    useState<UserProgress>(initialUser1Progress);
  const [user2Progress, setUser2Progress] =
    useState<UserProgress>(initialUser2Progress);
  const [activeTab, setActiveTab] = useState<string>('user1');

  const handleTaskToggle = (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => {
    const progressUpdater =
      activeTab === 'user1' ? setUser1Progress : setUser2Progress;
    progressUpdater(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [subject]: {
          ...prev[day][subject],
          [task]: isCompleted,
        },
      },
    }));
  };

  const activeProgress = activeTab === 'user1' ? user1Progress : user2Progress;

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
  progress: UserProgress;
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
