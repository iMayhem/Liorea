export interface Task {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface Subject {
  name: string;
}

export interface Test {
    name: string;
    date: string;
}

export type DaySchedule = Subject[];

export interface TimeTableData {
  [day: string]: DaySchedule;
}

export interface UserProgress {
  [day: string]: {
    [subject: string]: {
      [taskId: string]: boolean;
    };
  };
}
