import type {TimeTableData, UserProgress, Subject} from './types';
import {format} from 'date-fns';

const dailySchedule: Subject[] = [
  {name: '11th Physics', time: '8:00 AM - 9:00 AM'},
  {name: '12th Physics', time: '9:00 AM - 10:00 AM'},
  {name: '11th Bio', time: '10:00 AM - 11:00 AM'},
  {name: '12th Bio', time: '11:00 AM - 12:00 PM'},
  {name: 'Organic Chemistry', time: '1:00 PM - 2:00 PM'},
  {name: 'Inorganic Chemistry', time: '2:00 PM - 3:00 PM'},
  {name: 'Physical Chemistry', time: '3:00 PM - 4:00 PM'},
];

const generateTodaysTimeTable = (): TimeTableData => {
  const today = new Date('2025-08-03T00:00:00');
  const dayKey = format(today, 'MMMM d, yyyy');
  return {
    [dayKey]: dailySchedule,
  };
};

export const timetableData: TimeTableData = generateTodaysTimeTable();

const createInitialProgress = (
  timetable: TimeTableData,
  completionRates: {[key: string]: number}
): UserProgress => {
  const progress: UserProgress = {};
  Object.keys(timetable).forEach(day => {
    progress[day] = {};
    timetable[day].forEach(subject => {
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