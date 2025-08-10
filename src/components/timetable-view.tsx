// src/components/timetable-view.tsx
'use client';

import React, {useMemo, useState, useEffect} from 'react';
import type {UserProgress, Subject, Task, PreparationPath, CustomTimetable, CustomSubject} from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {BookOpen, ClipboardList, Pencil, RefreshCw, CheckSquare, Trophy as TrophyIcon, FilePlus } from 'lucide-react';
import {motion} from 'framer-motion';
import {RewardDialog} from './reward-dialog';
import {ScoreDialog} from './score-dialog';
import { testSchedule } from '@/lib/data';
import { Button } from './ui/button';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getDay } from 'date-fns';


interface TimeTableViewProps {
  day: string;
  subjects: CustomSubject[];
  progress: UserProgress;
  onTaskToggle: (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => void;
  onScoreSave: (day: string, subject: string, score: number) => void;
  isReadOnly: boolean;
  preparationPath?: PreparationPath | null;
  userTimetable: CustomTimetable | null;
}

const defaultTasks: Task[] = [
  {id: 'lecture', label: 'Attend Lecture'},
  {id: 'notes', label: 'Make Notes'},
  {id: 'homework', label: 'Complete Homework'},
  {id: 'revision', label: 'Revise'},
];

const genericTask: Task[] = [{ id: 'completed', label: 'Completed' }];

const getTasksForSubject = (subject: CustomSubject): Task[] => {
    if (subject.tasks && subject.tasks.length > 0) {
        return subject.tasks;
    }
    // Fallback for older data structure or test days
    if (testSchedule.some(test => test.name === subject.name)) {
        return [{ id: 'attempted', label: 'Attempted' }];
    }
    if (['Short Notes', 'Full Week Revision', 'Backlog'].includes(subject.name)) {
        return genericTask;
    }
    return defaultTasks;
};

function calculateCompletionPercentage(
  subjects: CustomSubject[],
  progress: UserProgress,
  day: string
) {
  if (!subjects || subjects.length === 0 || !progress || !progress[day]) {
    return 0;
  }
  let totalTasks = 0;
  let completedTasks = 0;

  subjects.forEach(subject => {
    const tasksForSubject = getTasksForSubject(subject);
    totalTasks += tasksForSubject.length;
    const subjectProgress = progress[day]?.[subject.name];
    if (subjectProgress) {
      // We only count boolean `true` values as completed tasks, ignoring the score
      completedTasks += Object.values(subjectProgress).filter(val => val === true).length;
    }
  });

  return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
}


export function TimeTableView({
  day,
  subjects,
  progress,
  onTaskToggle,
  onScoreSave,
  isReadOnly,
  preparationPath,
  userTimetable
}: TimeTableViewProps) {
  const [showReward, setShowReward] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [selectedSubjectForScore, setSelectedSubjectForScore] = useState<string | null>(null);

  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(subjects, progress, day),
    [subjects, progress, day]
  );
  
  const [rewardShown, setRewardShown] = useState(false);

  useEffect(() => {
    if (completionPercentage === 100 && !rewardShown) {
      setShowReward(true);
      setRewardShown(true); 
    }
    if (completionPercentage < 100) {
      setRewardShown(false);
    }
  }, [completionPercentage, rewardShown]);

  const handleSaveScoreClick = (subjectName: string) => {
    setSelectedSubjectForScore(subjectName);
    setShowScoreDialog(true);
  };
  
  const handleScoreDialogSubmit = (score: number) => {
    if(selectedSubjectForScore) {
      onScoreSave(day, selectedSubjectForScore, score);
    }
    setShowScoreDialog(false);
    setSelectedSubjectForScore(null);
  }

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
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const chartData = [{ name: 'progress', value: completionPercentage, fill: 'hsl(var(--primary))' }];
  const chartConfig = {
      progress: {
        label: "Progress",
      },
  };

  const getTaskIcon = (taskLabel: string) => {
    const lowerLabel = taskLabel.toLowerCase();
    if (lowerLabel.includes('lecture')) return <BookOpen className="h-4 w-4" />;
    if (lowerLabel.includes('notes')) return <Pencil className="h-4 w-4" />;
    if (lowerLabel.includes('homework')) return <ClipboardList className="h-4 w-4" />;
    if (lowerLabel.includes('revise')) return <RefreshCw className="h-4 w-4" />;
    if (lowerLabel.includes('attempted')) return <TrophyIcon className="h-4 w-4" />;
    return <CheckSquare className="h-4 w-4" />;
  }

  return (
    <>
    <RewardDialog isOpen={showReward} onOpenChange={setShowReward} />
    {selectedSubjectForScore && (
        <ScoreDialog
            isOpen={showScoreDialog}
            onOpenChange={setShowScoreDialog}
            onSave={handleScoreDialogSubmit}
            testName={selectedSubjectForScore}
        />
    )}
    <Card className="shadow-lg bg-card">
       <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
                <CardTitle className="font-heading">Today's Schedule ({day})</CardTitle>
                <CardDescription>
                Check off your tasks as you complete them.
                </CardDescription>
            </div>
            <div className="flex items-center justify-center">
                 <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-24"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={-90}
                        endAngle={270}
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={10}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar
                            dataKey="value"
                            background={{ fill: 'hsl(var(--muted))' }}
                            cornerRadius={5}
                        />
                         <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-current text-lg font-bold text-foreground"
                            >
                            {Math.round(completionPercentage)}%
                        </text>
                    </RadialBarChart>
                </ChartContainer>
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
            {subjects.map((subject: CustomSubject) => {
                const isTest = testSchedule.some(test => test.name === subject.name);
                const savedScore = progress[day]?.[subject.name]?.score;
                const tasks = getTasksForSubject(subject);

               return (
              <motion.div key={subject.id || subject.name} variants={itemVariants}>
                <Card className="shadow-md bg-card/80 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading">
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 pl-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={`${day}-${subject.name}-${task.id}`}
                            checked={
                              !!progress[day]?.[subject.name]?.[task.id]
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
                            {getTaskIcon(task.label)}
                            {task.label}
                          </label>
                        </div>
                      ))}
                      {isTest && !isReadOnly && (
                        <div className="mt-4">
                          {typeof savedScore === 'number' ? (
                                <p className="text-sm font-medium text-primary">Score: {savedScore}/720</p>
                          ) : (
                            <Button size="sm" onClick={() => handleSaveScoreClick(subject.name)}>
                                <FilePlus className="mr-2 h-4 w-4" />
                                Save Score
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )})}
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
