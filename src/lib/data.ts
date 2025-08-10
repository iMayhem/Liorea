import type {TimeTableData, CustomSubject, Test, CustomTimetable} from './types';
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

const defaultTasks = [
  {id: 'task-1', label: 'Attend Lecture'},
  {id: 'task-2', label: 'Make Notes'},
  {id: 'task-3', label: 'Complete Homework'},
  {id: 'task-4', label: 'Revise'},
];

const genericTasks = [{ id: 'task-1', label: 'Completed' }];

export const defaultAchieverSchedule: {[key: number]: CustomSubject[]} = {
  0: [{id: 'sub-1', name: 'Short Notes', tasks: genericTasks}, {id: 'sub-2', name: 'Full Week Revision', tasks: genericTasks}], // Sunday
  1: [ // Monday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Botany', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  2: [ // Tuesday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Zoology', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  3: [ // Wednesday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Botany', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  4: [ // Thursday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Zoology', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  5: [ // Friday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Botany', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  6: [ // Saturday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Zoology', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
};

export const defaultJeeSchedule: {[key: number]: CustomSubject[]} = {
  0: [{id: 'sub-1', name: 'Short Notes', tasks: genericTasks}, {id: 'sub-2', name: 'Full Week Revision', tasks: genericTasks}], // Sunday
  1: [ // Monday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  2: [ // Tuesday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  3: [ // Wednesday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  4: [ // Thursday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  5: [ // Friday
    {id: 'sub-1', name: '12th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Inorganic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
  6: [ // Saturday
    {id: 'sub-1', name: '11th Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Organic Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Maths', tasks: defaultTasks},
    {id: 'sub-4', name: 'Backlog', tasks: genericTasks},
  ],
};


export const generateTimeTableForDate = (dateKey: string, path?: string | null, customTimetable?: CustomTimetable | null): TimeTableData => {
  const date = parse(dateKey, 'MMMM d, yyyy', new Date());
  const dayOfWeek = getDay(date);

  // Use custom timetable if it exists for that day
  if (customTimetable && customTimetable[dayOfWeek]) {
      return { [dateKey]: customTimetable[dayOfWeek] };
  }

  // Fallback to default schedules
  if (path === 'neet-achiever') {
      const testForDay = testSchedule.find(test => test.date === dateKey);
      if (testForDay) {
        return {
          [dateKey]: [{ id: 'test-1', name: testForDay.name, tasks: [{id: 'task-1', label: 'Attempted'}] }],
        }
      }
  }
  
  const defaultSchedule = path === 'jee' ? defaultJeeSchedule : defaultAchieverSchedule;
  return { [dateKey]: defaultSchedule[dayOfWeek] || [] };
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
        subject.tasks.forEach(task => {
          progress[day][subject.name][task.id] = false;
        })
      }
    });
  });
  return progress;
};
