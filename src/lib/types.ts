// src/lib/types.ts
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

// UserProgress can now store a numeric score for a subject
// alongside the boolean task completion status.
export interface UserProgress {
  [day:string]: {
    [subject: string]: {
      [taskId: string]: boolean;
      score?: number; // Optional score field
    }
  }
}

export interface Question {
  id?: string; // Optional for local data
  questionNumber: number;
  questionText: string;
  questionImageURL?: string;
  options: {[key: string]: string};
  correctAnswer: string;
  chapter?: string;
  subject?: string;
}

export interface QuizProgress {
    [questionNumber: number]: {
        selected: string;
        isCorrect: boolean;
        bookmarked?: boolean;
    }
}

export interface UserQuizProgress {
    [subject: string]: {
        [chapter: string]: QuizProgress
    }
}

// Types for "Study Together" feature
export type AnimationType = 'rain' | 'fire' | 'snow' | 'confetti' | 'stars';
export type SoundType = 'rain' | 'fire' | 'coffee' | 'ocean' | 'none';

export interface TimerState {
    mode: 'study' | 'shortBreak' | 'longBreak';
    time: number;
    isActive: boolean;
    startTime: any; // Can be Firebase ServerTimestamp
    studyDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
}

export interface Participant {
  uid: string;
  username: string | null;
  photoURL?: string | null;
}

export interface ChatMessage {
    id: string;
    text: string;
    imageUrl?: string | null; // Optional field for image data URI
    senderId: string;
    senderName: string;
    timestamp: any; // Can be Firebase ServerTimestamp
    replyToId?: string;
    replyToText?: string;
}

export interface Notepad {
  name: string;
  content: string;
  owner: string | null; // UID of the owner, null for collaborative
}

export interface Notepads {
  [id: string]: Notepad; // e.g., { collaborative: { name: '...', content: '...', owner: null }, notepad1: {...} }
}

export interface StudyRoom {
    id: string;
    ownerId: string;
    createdAt: any;
    participants: Participant[];
    // ... other room properties
}


// New type for user profiles
export type PreparationPath = 'neet-achiever' | 'neet-other' | 'jee';

export interface UserProfile {
    uid: string;
    username: string | null;
    email: string | null;
    photoURL: string | null;
    totalStudyHours: number;
    dailyStudyHours?: number; // Optional field for daily calculation
    dailyStreak: number;
    mockScores: number[];
    leaderboardVisibility?: 'visible' | 'anonymous' | 'hidden';
    createdAt: any; // Can be server timestamp
    preparationPath?: PreparationPath | null;
    status?: {
      isStudying: boolean;
      isJamming?: boolean;
      roomId: string | null;
    }
}

export interface PrivateChatMessage {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: any; // Firestore ServerTimestamp
    replyToId?: string;
    replyToText?: string;
}


export interface Report {
    userId: string;
    username: string | null;
    title: string;
    description: string;
    imageUrl?: string | null;
    timestamp: any;
    status: 'open' | 'closed' | 'in-progress';
}
