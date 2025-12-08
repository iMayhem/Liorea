export type User = {
  id: number;
  name: string;
  avatarImageId: string;
  studyTime: number; // in minutes
  status: 'online' | 'offline';
  lastSeen?: string;
  role: 'user' | 'mod' | 'helper';
  isBlocked: boolean;
};

export const mockUsers: User[] = [
  { id: 1, name: 'Alex', avatarImageId: 'user-avatar-1', studyTime: 4 * 60 + 25, status: 'online', role: 'mod', isBlocked: false },
  { id: 2, name: 'Brenda', avatarImageId: 'user-avatar-2', studyTime: 3 * 60 + 50, status: 'online', role: 'user', isBlocked: false },
  { id: 3, name: 'Charlie', avatarImageId: 'user-avatar-3', studyTime: 3 * 60 + 15, status: 'offline', lastSeen: '15m ago', role: 'user', isBlocked: false },
  { id: 4, name: 'Diana', avatarImageId: 'user-avatar-4', studyTime: 2 * 60 + 30, status: 'online', role: 'helper', isBlocked: false },
  { id: 5, name: 'Ethan', avatarImageId: 'user-avatar-5', studyTime: 2 * 60 + 5, status: 'offline', lastSeen: '1h ago', role: 'user', isBlocked: true },
  { id: 6, name: 'Fiona', avatarImageId: 'user-avatar-6', studyTime: 1 * 60 + 45, status: 'online', role: 'user', isBlocked: false },
  { id: 7, name: 'George', avatarImageId: 'user-avatar-7', studyTime: 1 * 60 + 10, status: 'offline', lastSeen: 'yesterday', role: 'user', isBlocked: false },
  { id: 8, name: 'Hannah', avatarImageId: 'user-avatar-8', studyTime: 55, status: 'online', role: 'user', isBlocked: false },
];
