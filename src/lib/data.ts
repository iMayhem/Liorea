import type {TimeTableData, UserProgress, Subject, Test} from './types';
import {parse, getDay, format} from 'date-fns';

export const testSchedule: Test[] = [
    { name: 'Minor Test-1', date: 'July 27, 2025' },
    { name: 'Minor Test-2', date: 'August 17, 2025' },
    { name: 'Minor Test-3', date: 'September 7, 2025' },
    { name: 'Minor Test-4', date: 'September 28, 2025' },
    { name: 'Minor Test-5', date: 'October 17, 2025' },
    { name: 'Test-6 (Semi Major)', date: 'November 2, 2025' },
    { name: 'Minor Test-7', date: 'November 23, 2025' },
    { name: 'Minor Test-8', date: 'December 14, 2025' },
    { name: 'Minor Test-9', date: 'January 4, 2026' },
    { name: 'Minor Test-10', date: 'January 25, 2026' },
    { name: 'Minor Test-11', date: 'February 15, 2026' },
    { name: 'Minor Test-12', date: 'March 1, 2026' },
];

const schedule: {[key: number]: Subject[]} = {
  0: [{name: 'Short Notes'}, {name: 'Full Week Revision'}], // Sunday
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

  // Check if it's a test day
  const testForDay = testSchedule.find(test => test.date === dateKey);
  if (testForDay) {
    return {
      [dateKey]: [{name: testForDay.name}],
    }
  }

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
      progress[day][subject.name] = {};
      
      const isTest = testSchedule.some(test => test.name === subject.name);

      if (isTest) {
        progress[day][subject.name]['attempted'] = false;
      } else {
        switch (subject.name) {
          case 'Short Notes':
            progress[day][subject.name]['completed'] = false;
            break;
          case 'Full Week Revision':
            progress[day][subject.name]['did_revise'] = false;
            break;
          default:
            progress[day][subject.name] = {
              lecture: false,
              notes: false,
              homework: false,
              revision: false,
            };
            break;
        }
      }
    });
  });
  return progress;
};
