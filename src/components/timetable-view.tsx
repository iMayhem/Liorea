// src/components/timetable-view.tsx
'use client';

import React, {useMemo, useState, useEffect} from 'react';
import type {UserProgress, Subject, Task} from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {BookOpen, ClipboardList, Pencil, RefreshCw, CheckSquare, Trophy as TrophyIcon} from 'lucide-react';
import {Progress} from './ui/progress';
import {motion} from 'framer-motion';
import {RewardDialog} from './reward-dialog';
import { testSchedule } from '@/lib/data';

interface TimeTableViewProps {
  day: string;
  subjects: Subject[];
  progress: UserProgress;
  onTaskToggle: (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => void;
  isReadOnly: boolean;
}

const defaultTasks: Task[] = [
  {id: 'lecture', label: 'Attend Lecture', icon: <BookOpen className="h-4 w-4" />},
  {id: 'notes', label: 'Make Notes', icon: <Pencil className="h-4 w-4" />},
  {id: 'homework', label: 'Complete Homework', icon: <ClipboardList className="h-4 w-4" />},
  {id: 'revision', label: 'Revise', icon: <RefreshCw className="h-4 w-4" />},
];

const getTasksForSubject = (subjectName: string): Task[] => {
    if (testSchedule.some(test => test.name === subjectName)) {
        return [{ id: 'attempted', label: 'Attempted', icon: <TrophyIcon className="h-4 w-4" /> }];
    }

    switch (subjectName) {
        case 'Short Notes':
            return [{ id: 'completed', label: 'Completed', icon: <CheckSquare className="h-4 w-4" /> }];
        case 'Full Week Revision':
            return [{ id: 'did_revise', label: 'Did Revise', icon: <CheckSquare className="h-4 w-4" /> }];
        default:
            return defaultTasks;
    }
};

function calculateCompletionPercentage(
  subjects: Subject[],
  progress: UserProgress,
  day: string
) {
  if (!subjects || subjects.length === 0 || !progress || !progress[day]) {
    return 0;
  }
  let totalTasks = 0;
  let completedTasks = 0;

  subjects.forEach(subject => {
    const tasksForSubject = getTasksForSubject(subject.name);
    totalTasks += tasksForSubject.length;
    const subjectProgress = progress[day]?.[subject.name];
    if (subjectProgress) {
      completedTasks += Object.values(subjectProgress).filter(Boolean).length;
    }
  });

  return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
}


export function TimeTableView({
  day,
  subjects,
  progress,
  onTaskToggle,
  isReadOnly,
}: TimeTableViewProps) {
  const [showReward, setShowReward] = useState(false);
  
  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(subjects, progress, day),
    [subjects, progress, day]
  );
  
  // Track if the reward has been shown for this session to avoid re-triggering
  const [rewardShown, setRewardShown] = useState(false);

  useEffect(() => {
    if (completionPercentage === 100 && !rewardShown) {
      setShowReward(true);
      setRewardShown(true); // Ensure it only triggers once per mount/day change
    }
     // Reset if the day changes and completion is no longer 100%
    if (completionPercentage < 100) {
      setRewardShown(false);
    }
  }, [completionPercentage, rewardShown]);

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <>
    <RewardDialog isOpen={showReward} onOpenChange={setShowReward} />
    <Card className="shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="font-heading">Today's Schedule ({day})</CardTitle>
        <CardDescription>
          Check off your tasks as you complete them.
        </CardDescription>
        <div className="pt-2">
          <Progress value={completionPercentage} className="w-full" />
          <p className="text-right text-sm text-muted-foreground mt-1">
            {Math.round(completionPercentage)}% Complete
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {subjects && subjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {subjects.map((subject: Subject) => (
              <motion.div key={subject.name} variants={itemVariants}>
                <Card className="shadow-md bg-card/80 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading">
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 pl-2">
                      {getTasksForSubject(subject.name).map(task => (
                        <div
                          key={task.id}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={`${day}-${subject.name}-${task.id}`}
                            checked={
                              progress[day]?.[subject.name]?.[task.id] ?? false
                            }
                            onCheckedChange={checked =>
                              onTaskToggle(
                                day,
                                subject.name,
                                task.id,
                                !!checked
                              )
                            }
                            disabled={isReadOnly}
                          />
                          <label
                            htmlFor={`${day}-${subject.name}-${task.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                          >
                            {task.icon}
                            {task.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No classes scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
    </>
  );
}
