"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Sparkles } from "lucide-react";
import { personalizedFeedback } from "@/ai/flows/personalized-feedback";
import type { TimeTableData, UserProgress } from "@/lib/types";

interface FeedbackCardProps {
  progress: UserProgress;
  timetable: TimeTableData;
}

function formatProgressForAI(
  progress: UserProgress,
  timetable: TimeTableData
): string {
  let report = "";
  for (const day of Object.keys(timetable)) {
    report += `On ${day}:\n`;
    const daySchedule = timetable[day];
    if (daySchedule.length === 0) {
      report += "  - No classes scheduled.\n";
      continue;
    }
    for (const subject of daySchedule) {
      report += `  - For ${subject.name}:\n`;
      const subjectProgress = progress[day]?.[subject.name];
      if (subjectProgress) {
        report += `    - Attended Lecture: ${
          subjectProgress.lecture ? "Yes" : "No"
        }\n`;
        report += `    - Took Notes: ${subjectProgress.notes ? "Yes" : "No"}\n`;
        report += `    - Completed Homework: ${
          subjectProgress.homework ? "Yes" : "No"
        }\n`;
        report += `    - Revised: ${
          subjectProgress.revision ? "Yes" : "No"
        }\n`;
      } else {
        report += "    - No tracking data available.\n";
      }
    }
  }
  return report;
}

export function FeedbackCard({ progress, timetable }: FeedbackCardProps) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateFeedback = async () => {
    setIsLoading(true);
    setFeedback("");
    try {
      const taskCompletionData = formatProgressForAI(progress, timetable);
      const result = await personalizedFeedback({ taskCompletionData });
      setFeedback(result.feedback);
    } catch (error) {
      console.error("Failed to get feedback:", error);
      setFeedback("Sorry, I couldn't generate feedback at this moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleGenerateFeedback}>
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary"/>
            Personalized Feedback
          </DialogTitle>
          <DialogDescription>
            Here is AI-powered feedback based on the tracked progress.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{feedback}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
