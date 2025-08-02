export interface Task {
  lecture: boolean;
  notes: boolean;
  homework: boolean;
  revision: boolean;
}

export interface Subject {
  name: string;
}

export type DaySchedule = Subject[];

export interface TimeTableData {
  [day: string]: DaySchedule;
}

export interface UserProgress {
  [day: string]: {
    [subject: string]: Task;
  };
}
