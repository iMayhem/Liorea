// src/components/timetable-view.tsx
'use client';

import React, {useMemo, useState, useEffect} from 'react';
import type {UserProgress, Subject, Task, PreparationPath} from '@/lib/types';
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
  onScoreSave: (day: string, subject: string, score: number) => void;
  isReadOnly: boolean;
  preparationPath?: PreparationPath | null;
}

const defaultTasks: Task[] = [
  {id: 'lecture', label: 'Attend Lecture', icon: <BookOpen className="h-4 w-4" />},
  {id: 'notes', label: 'Make Notes', icon: <Pencil className="h-4 w-4" />},
  {id: 'homework', label: 'Complete Homework', icon: <ClipboardList className="h-4 w-4" />},
  {id: 'revision', label: 'Revise', icon: <RefreshCw className="h-4 w-4" />},
];

const genericTask: Task[] = [{ id: 'completed', label: 'Completed', icon: <CheckSquare className="h-4 w-4" /> }];

const getTasksForSubject = (subjectName: string, path?: PreparationPath | null): Task[] => {
    if (path === 'neet-achiever') {
        if (testSchedule.some(test => test.name === subjectName)) {
            return [{ id: 'attempted', label: 'Attempted', icon: <TrophyIcon className="h-4 w-4" /> }];
        }
    }
    
    // For all paths, certain subjects have specific tasks
    if (['Short Notes', 'Full Week Revision', 'Backlog'].includes(subjectName)) {
        return genericTask;
    }

    // Default tasks for regular subjects across all paths
    return defaultTasks;
};

function calculateCompletionPercentage(
  subjects: Subject[],
  progress: UserProgress,
  day: string,
  path?: PreparationPath | null,
) {
  if (!subjects || subjects.length === 0 || !progress || !progress[day]) {
    return 0;
  }
  let totalTasks = 0;
  let completedTasks = 0;

  subjects.forEach(subject => {
    const tasksForSubject = getTasksForSubject(subject.name, path);
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
  preparationPath
}: TimeTableViewProps) {
  const [showReward, setShowReward] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [selectedSubjectForScore, setSelectedSubjectForScore] = useState<string | null>(null);

  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(subjects, progress, day, preparationPath),
    [subjects, progress, day, preparationPath]
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
            {subjects.map((subject: Subject) => {
                const isTest = testSchedule.some(test => test.name === subject.name);
                const savedScore = progress[day]?.[subject.name]?.score;

               return (
              <motion.div key={subject.name} variants={itemVariants}>
                <Card className="shadow-md bg-card/80 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading">
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 pl-2">
                      {getTasksForSubject(subject.name, preparationPath).map(task => (
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
                            {task.icon}
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
