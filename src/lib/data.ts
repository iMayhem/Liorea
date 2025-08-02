import type { TimeTableData, UserProgress } from "./types";
import { format, eachDayOfInterval, getDay } from 'date-fns';

const weeklySchedule: { [key: number]: { name: string; time: string }[] } = {
  1: [ // Monday
    { name: "Physics", time: "9:00 AM - 10:30 AM" },
    { name: "Chemistry", time: "11:00 AM - 12:30 PM" },
  ],
  2: [ // Tuesday
    { name: "Biology", time: "9:00 AM - 10:30 AM" },
    { name: "Physics", time: "2:00 PM - 3:30 PM" },
  ],
  3: [ // Wednesday
    { name: "Chemistry", time: "9:00 AM - 10:30 AM" },
    { name: "Biology", time: "11:00 AM - 12:30 PM" },
  ],
  4: [ // Thursday
    { name: "Physics", time: "9:00 AM - 10:30 AM" },
    { name: "Chemistry", time: "2:00 PM - 3:30 PM" },
  ],
  5: [ // Friday
    { name: "Biology", time: "9:00 AM - 10:30 AM" },
    { name: "Physics", time: "11:00 AM - 12:30 PM" },
  ],
  6: [ // Saturday
    { name: "Chemistry", time: "10:00 AM - 12:00 PM" }
  ],
  0: [], // Sunday
};

const generateTimeTableData = (): TimeTableData => {
  const startDate = new Date('2025-08-03');
  const endDate = new Date('2026-05-05');
  const interval = eachDayOfInterval({ start: startDate, end: endDate });
  const timetable: TimeTableData = {};

  interval.forEach(date => {
    const dayOfWeek = getDay(date);
    const dayKey = format(date, 'MMMM d, yyyy');
    timetable[dayKey] = weeklySchedule[dayOfWeek];
  });

  return timetable;
}

export const timetableData: TimeTableData = generateTimeTableData();

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
