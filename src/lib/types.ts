// Add this to your existing types
export interface Background {
    id: string;
    url: string;
    name: string;
    isActive: boolean;
}

// ... keep your existing types below ...
export type SoundType = 'rain' | 'fire' | 'coffee' | 'ocean' | 'none';
export interface TimerState {
    mode: 'study' | 'break';
    time: number;
    isActive: boolean;
    totalDuration: number;
}
export interface Participant {
  uid: string;
  username: string | null;
  photoURL?: string | null;
  joinedAt?: string;
}
export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    replyToId?: string;
    replyToText?: string;
    isMod?: boolean;
}
export interface StudyRoom {
    id: string;
    ownerId: string;
    participants: Participant[];
    current_video_id?: string;
    activeSound: SoundType;
    typingUsers?: { [uid: string]: string };
}
export interface UserProfile {
    uid: string;
    username: string | null;
    email: string | null;
    photoURL: string | null;
    lastSeen: string;
    isBlocked?: boolean;
    role?: string;
    feeling?: string;
    createdAt?: string;
    customTimetable?: any; // Added missing field
    totalStudyHours?: number; // Added missing field
    dailyStreak?: number; // Added missing field
}
export interface CustomTimetable { [key: string]: any[] }; // Simplified
export interface TimeTableData { [key: string]: any[] }; // Simplified
export interface UserProgress { [key: string]: any }; // Simplified
export interface SiteNotification {
    id: string;
    message: string;
    timestamp: any;
}