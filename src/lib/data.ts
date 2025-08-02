import type {TimeTableData, UserProgress, Subject} from './types';

const dailySchedule: Subject[] = [
  {name: '11th Physics'},
  {name: '12th Physics'},
  {name: '11th Bio'},
  {name: '12th Bio'},
  {name: 'Organic Chemistry'},
  {name: 'Inorganic Chemistry'},
  {name: 'Physical Chemistry'},
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
