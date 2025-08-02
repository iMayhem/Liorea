"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { TimeTableData, UserProgress, Subject } from "@/lib/types";
import { Atom, Dna, FlaskConical } from "lucide-react";

interface TimeTableViewProps {
  timetable: TimeTableData;
  progress: UserProgress;
  onTaskToggle: (
    day: string,
    subject: string,
    task: string,
    isCompleted: boolean
  ) => void;
}

const subjectIcons: { [key: string]: React.ReactNode } = {
  Physics: <Atom className="h-5 w-5" />,
  Chemistry: <FlaskConical className="h-5 w-5" />,
  Biology: <Dna className="h-5 w-5" />,
};

const tasks = [
  { id: "lecture", label: "Attend Lecture" },
  { id: "notes", label: "Make Notes" },
  { id: "homework", label: "Complete Homework" },
  { id: "revision", label: "Revise" },
];

export function TimeTableView({
  timetable,
  progress,
  onTaskToggle,
}: TimeTableViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(timetable).map(([day, subjects]) => (
        <Card key={day} className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg">{day}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {subjects.length > 0 ? (
              <div className="space-y-6">
                {subjects.map((subject: Subject, index: number) => (
                  <div key={`${subject.name}-${index}`}>
                    <div className="mb-4">
                      <h3 className="flex items-center gap-2 text-md font-semibold text-accent">
                        {subjectIcons[subject.name]}
                        {subject.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.time}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${day}-${subject.name}-${task.id}`}
                            checked={
                              progress[day]?.[subject.name]?.[task.id] ?? false
                            }
                            onCheckedChange={(checked) =>
                              onTaskToggle(
                                day,
                                subject.name,
                                task.id,
                                !!checked
                              )
                            }
                          />
                          <Label
                            htmlFor={`${day}-${subject.name}-${task.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {task.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {index < subjects.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No classes scheduled.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
