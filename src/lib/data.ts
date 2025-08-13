import type {TimeTableData, CustomSubject, Test, CustomTimetable} from './types';
import {parse, getDay, format} from 'date-fns';

export const testSchedule: Test[] = [
    { name: 'Minor Test-1', date: 'July 27, 2025' },
    { name: "Something's coming", date: 'August 17, 2025' },
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

const defaultWeeklySchedule: {[key: number]: CustomSubject[]} = {
  0: [{id: 'sub-1', name: 'Weekly Revision', tasks: genericTasks}, {id: 'sub-2', name: 'Backlog', tasks: genericTasks}], // Sunday
  1: [ // Monday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Biology', tasks: defaultTasks},
  ],
  2: [ // Tuesday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', 'name': 'Biology', tasks: defaultTasks},
  ],
  3: [ // Wednesday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Biology', tasks: defaultTasks},
  ],
  4: [ // Thursday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Biology', tasks: defaultTasks},
  ],
  5: [ // Friday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Biology', tasks: defaultTasks},
  ],
  6: [ // Saturday
    {id: 'sub-1', name: 'Physics', tasks: defaultTasks},
    {id: 'sub-2', name: 'Chemistry', tasks: defaultTasks},
    {id: 'sub-3', name: 'Biology', tasks: defaultTasks},
  ],
};


export const generateTimeTableForDate = (dateKey: string, customTimetable?: CustomTimetable | null): TimeTableData => {
  const date = parse(dateKey, 'MMMM d, yyyy', new Date());
  const specificDateKey = format(date, 'yyyy-MM-dd');
  const dayOfWeek = getDay(date);

  // Priority order:
  // 1. Custom schedule for the specific date
  if (customTimetable && customTimetable[specificDateKey]) {
      return { [dateKey]: customTimetable[specificDateKey] };
  }

  // 2. Custom schedule for the recurring day of the week
  if (customTimetable && customTimetable[dayOfWeek]) {
      return { [dateKey]: customTimetable[dayOfWeek] };
  }

  // 3. Fallback to default weekly schedule
  const testForDay = testSchedule.find(test => test.date === dateKey);
  if (testForDay) {
    return {
      [dateKey]: [{ id: 'test-1', name: testForDay.name, tasks: [{id: 'task-1', label: 'Attempted'}] }],
    }
  }

  return { [dateKey]: defaultWeeklySchedule[dayOfWeek] || [] };
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
