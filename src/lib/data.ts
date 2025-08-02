import type { TimeTableData, UserProgress } from "./types";

export const timetableData: TimeTableData = {
  Monday: [
    { name: "Physics", time: "9:00 AM - 10:30 AM" },
    { name: "Chemistry", time: "11:00 AM - 12:30 PM" },
  ],
  Tuesday: [
    { name: "Biology", time: "9:00 AM - 10:30 AM" },
    { name: "Physics", time: "2:00 PM - 3:30 PM" },
  ],
  Wednesday: [
    { name: "Chemistry", time: "9:00 AM - 10:30 AM" },
    { name: "Biology", time: "11:00 AM - 12:30 PM" },
  ],
  Thursday: [
    { name: "Physics", time: "9:00 AM - 10:30 AM" },
    { name: "Chemistry", time: "2:00 PM - 3:30 PM" },
  ],
  Friday: [
    { name: "Biology", time: "9:00 AM - 10:30 AM" },
    { name: "Physics", time: "11:00 AM - 12:30 PM" },
  ],
  Saturday: [{ name: "Chemistry", time: "10:00 AM - 12:00 PM" }],
  Sunday: [],
};

const createInitialProgress = (
  timetable: TimeTableData,
  completionRates: { [key: string]: number }
): UserProgress => {
  const progress: UserProgress = {};
  Object.keys(timetable).forEach((day) => {
    progress[day] = {};
    timetable[day].forEach((subject) => {
      progress[day][subject.name] = {
        lecture: Math.random() < (completionRates.lecture ?? 0.8),
        notes: Math.random() < (completionRates.notes ?? 0.6),
        homework: Math.random() < (completionRates.homework ?? 0.7),
        revision: Math.random() < (completionRates.revision ?? 0.4),
      };
    });
  });
  return progress;
};

export const user1ProgressData: UserProgress = createInitialProgress(
  timetableData,
  {
    lecture: 0.9,
    notes: 0.7,
    homework: 0.8,
    revision: 0.5,
  }
);

export const user2ProgressData: UserProgress = createInitialProgress(
  timetableData,
  {
    lecture: 0.7,
    notes: 0.5,
    homework: 0.6,
    revision: 0.3,
  }
);
