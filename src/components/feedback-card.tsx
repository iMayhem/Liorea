"use client";

import { useState } from "react";
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
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGenerateFeedback = async () => {
    setIsLoading(true);
    setFeedback("");
    setShowFeedback(true);
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
    <div style={{marginTop: '1rem'}}>
      <button onClick={handleGenerateFeedback}>
        Get AI Feedback
      </button>
      {showFeedback && (
        <div style={{marginTop: '1rem', border: '1px solid black', padding: '1rem'}}>
          <h3>Personalized Feedback</h3>
          <p>
            Here is AI-powered feedback based on the tracked progress.
          </p>
          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <p>{feedback}</p>
            )}
          </div>
           <button onClick={() => setShowFeedback(false)} style={{marginTop: '1rem'}}>Close</button>
        </div>
      )}
    </div>
  );
}
