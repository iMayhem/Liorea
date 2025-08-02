'use client';

import type {UserProgress, Subject} from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {Checkbox} from '@/components/ui/checkbox';
import {BookOpen, ClipboardList, Pencil, RefreshCw} from 'lucide-react';
import {Progress} from './ui/progress';
import { useMemo } from 'react';

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

const tasks = [
  {id: 'lecture', label: 'Attend Lecture', icon: <BookOpen className="h-4 w-4" />},
  {id: 'notes', label: 'Make Notes', icon: <Pencil className="h-4 w-4" />},
  {id: 'homework', label: 'Complete Homework', icon: <ClipboardList className="h-4 w-4" />},
  {id: 'revision', label: 'Revise', icon: <RefreshCw className="h-4 w-4" />},
];

function calculateCompletionPercentage(
  subjects: Subject[],
  progress: UserProgress,
  day: string
) {
  if (!subjects || subjects.length === 0) {
    return 0;
  }
  let totalTasks = 0;
  let completedTasks = 0;

  subjects.forEach(subject => {
    const subjectProgress = progress[day]?.[subject.name];
    if (subjectProgress) {
      totalTasks += tasks.length;
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

  const completionPercentage = useMemo(() => calculateCompletionPercentage(subjects, progress, day), [subjects, progress, day]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Today's Schedule ({day})</CardTitle>
        <CardDescription>
          Check off your tasks as you complete them.
        </CardDescription>
        <div className="pt-2">
          <Progress value={completionPercentage} className="w-full" />
          <p className="text-right text-sm text-muted-foreground mt-1">{Math.round(completionPercentage)}% Complete</p>
        </div>
      </CardHeader>
      <CardContent>
        {subjects && subjects.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {subjects.map((subject: Subject) => (
              <AccordionItem
                value={subject.name}
                key={subject.name}
              >
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <h3 className="font-semibold">{subject.name}</h3>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pl-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-3">
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No classes scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
