import type {TimeTableData, UserProgress, Subject} from './types';
import {parse, getDay} from 'date-fns';

const schedule: {[key: number]: Subject[]} = {
  0: [], // Sunday
  1: [ // Monday
    {name: '12th Physics'},
    {name: 'Inorganic Chemistry'},
    {name: 'Botany'},
    {name: 'Backlog'},
  ],
  2: [ // Tuesday
    {name: '11th Physics'},
    {name: 'Organic Chemistry'},
    {name: 'Zoology'},
    {name: 'Backlog'},
  ],
  3: [ // Wednesday
    {name: '12th Physics'},
    {name: 'Inorganic Chemistry'},
    {name: 'Botany'},
    {name: 'Backlog'},
  ],
  4: [ // Thursday
    {name: '11th Physics'},
    {name: 'Organic Chemistry'},
    {name: 'Zoology'},
    {name: 'Backlog'},
  ],
  5: [ // Friday
    {name: '12th Physics'},
    {name: 'Inorganic Chemistry'},
    {name: 'Botany'},
    {name: 'Backlog'},
  ],
  6: [ // Saturday
    {name: '11th Physics'},
    {name: 'Organic Chemistry'},
    {name: 'Zoology'},
    {name: 'Backlog'},
  ],
};


export const generateTimeTableForDate = (dateKey: string): TimeTableData => {
  // The dateKey is in "MMMM d, yyyy" format. We parse it to get a Date object.
  const date = parse(dateKey, 'MMMM d, yyyy', new Date());
  // getDay() returns the day of the week, where Sunday is 0, Monday is 1, etc.
  const dayOfWeek = getDay(date);

  return {
    [dateKey]: schedule[dayOfWeek] || [],
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
