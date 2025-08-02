import type {TimeTableData, UserProgress, Subject} from './types';

const dailySchedule: Subject[] = [
  {name: '11th Physics', time: '8:00 AM - 9:00 AM'},
  {name: '12th Physics', time: '9:00 AM - 10:00 AM'},
  {name: '11th Bio', time: '10:00 AM - 11:00 AM'},
  {name: '12th Bio', time: '11:00 AM - 12:00 PM'},
  {name: 'Organic Chemistry', time: '1:00 PM - 2:00 PM'},
  {name: 'Inorganic Chemistry', time: '2:00 PM - 3:00 PM'},
  {name: 'Physical Chemistry', time: '3:00 PM - 4:00 PM'},
];

export const generateTimeTableForDate = (dateKey: string): TimeTableData => {
  return {
    [dateKey]: dailySchedule,
  };
};

export const generateInitialProgressForDate = (
  timetable: TimeTableData
): UserProgress => {
  const progress: UserProgress = {};
  Object.keys(timetable).forEach(day => {
    progress[day] = {};
    timetable[day].forEach(subject => {
      progress[day][subject.name] = {
        lecture: false,
        notes: false,
        homework: false,
        revision: false,
      };
    });
  });
  return progress;
};
