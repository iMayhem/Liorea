"use client";

import React, { useState } from "react";
import type { TimeTableData, UserProgress } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeTableView } from "@/components/timetable-view";
import { FeedbackCard } from "@/components/feedback-card";
import { AppHeader } from "@/components/header";

interface DashboardProps {
  timetable: TimeTableData;
  user1Progress: UserProgress;
  user2Progress: UserProgress;
}

export function Dashboard({
  timetable,
  user1Progress: initialUser1Progress,
  user2Progress: initialUser2Progress,
}: DashboardProps) {
  const [user1Progress, setUser1Progress] =
    useState<UserProgress>(initialUser1Progress);
  const [user2Progress, setUser2Progress] =
    useState<UserProgress>(initialUser2Progress);
  const [activeTab, setActiveTab] = useState<string>("user1");

  const handleTaskToggle = (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => {
    if (activeTab === "user1") {
      setUser1Progress((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [subject]: {
            ...prev[day][subject],
            [task]: isCompleted,
          },
        },
      }));
    } else {
      setUser2Progress((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [subject]: {
            ...prev[day][subject],
            [task]: isCompleted,
          },
        },
      }));
    }
  };

  const activeProgress = activeTab === "user1" ? user1Progress : user2Progress;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="user1">My Progress</TabsTrigger>
              <TabsTrigger value="user2">Partner's Progress</TabsTrigger>
            </TabsList>
            <FeedbackCard
              key={activeTab}
              progress={activeProgress}
              timetable={timetable}
            />
          </div>
          <TabsContent value="user1">
            <TimeTableView
              timetable={timetable}
              progress={user1Progress}
              onTaskToggle={handleTaskToggle}
            />
          </TabsContent>
          <TabsContent value="user2">
            <TimeTableView
              timetable={timetable}
              progress={user2Progress}
              onTaskToggle={handleTaskToggle}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
