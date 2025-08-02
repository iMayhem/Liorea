"use client";

import React, { useState } from "react";
import type { TimeTableData, UserProgress } from "@/lib/types";
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
    <div>
      <AppHeader />
      <main style={{padding: '1rem'}}>
        <div>
          <button onClick={() => setActiveTab("user1")} style={{marginRight: '1rem', textDecoration: activeTab === 'user1' ? 'underline' : 'none' }}>My Progress</button>
          <button onClick={() => setActiveTab("user2")} style={{ textDecoration: activeTab === 'user2' ? 'underline' : 'none' }}>Partner's Progress</button>
        </div>
        
        <FeedbackCard
          key={activeTab}
          progress={activeProgress}
          timetable={timetable}
        />

        <hr style={{margin: '1rem 0'}} />
        
        {activeTab === 'user1' && (
           <TimeTableView
            timetable={timetable}
            progress={user1Progress}
            onTaskToggle={handleTaskToggle}
          />
        )}
        {activeTab === 'user2' && (
          <TimeTableView
            timetable={timetable}
            progress={user2Progress}
            onTaskToggle={handleTaskToggle}
          />
        )}
      </main>
    </div>
  );
}
