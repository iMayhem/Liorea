'use client';

import {useState} from 'react';
import {personalizedFeedback} from '@/ai/flows/personalized-feedback';
import type {TimeTableData, UserProgress} from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Loader2, Wand, X} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

interface FeedbackCardProps {
  progress: UserProgress;
  timetable: TimeTableData;
}

function formatProgressForAI(
  progress: UserProgress,
  timetable: TimeTableData
): string {
  let report = '';
  for (const day of Object.keys(timetable)) {
    report += `On ${day}:\n`;
    const daySchedule = timetable[day];
    if (!daySchedule || daySchedule.length === 0) {
      report += '  - No classes scheduled.\n';
      continue;
    }
    for (const subject of daySchedule) {
      report += `  - For ${subject.name}:\n`;
      const subjectProgress = progress[day]?.[subject.name];
      if (subjectProgress) {
        report += `    - Attended Lecture: ${
          subjectProgress.lecture ? 'Yes' : 'No'
        }\n`;
        report += `    - Took Notes: ${subjectProgress.notes ? 'Yes' : 'No'}\n`;
        report += `    - Completed Homework: ${
          subjectProgress.homework ? 'Yes' : 'No'
        }\n`;
        report += `    - Revised: ${
          subjectProgress.revision ? 'Yes' : 'No'
        }\n`;
      } else {
        report += '    - No tracking data available.\n';
      }
    }
  }
  return report;
}

export function FeedbackCard({progress, timetable}: FeedbackCardProps) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFeedback = async () => {
    setIsLoading(true);
    setFeedback('');
    setShowFeedback(true);
    setError(null);
    try {
      const taskCompletionData = formatProgressForAI(progress, timetable);
      const result = await personalizedFeedback({taskCompletionData});
      setFeedback(result.feedback);
    } catch (error) {
      console.error('Failed to get feedback:', error);
      setError(
        "Sorry, I couldn't generate feedback at this moment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!showFeedback) {
    return (
       <Button onClick={handleGenerateFeedback} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Get AI Feedback
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="relative shadow-lg">
       <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-6 w-6"
          onClick={() => setShowFeedback(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      <CardHeader>
        <CardTitle>Personalized Feedback</CardTitle>
        <CardDescription>
          AI-powered feedback based on your tracked progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p>Analyzing your progress...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{feedback}</p>
        )}
      </CardContent>
       <CardFooter>
        <Button onClick={handleGenerateFeedback} disabled={isLoading} size="sm">
         {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Regenerate
          </>
        )}
      </Button>
      </CardFooter>
    </Card>
  );
}
