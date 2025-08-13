// src/components/user-activity-list.tsx
'use client';

import * as React from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Users } from 'lucide-react';

const toPlainObject = (data: any) => {
    if (!data) return data;
    const plainData = { ...data };
    for (const key in plainData) {
        if (plainData[key]?.toDate) {
            plainData[key] = plainData[key].toDate().toISOString();
        }
    }
    return plainData;
}

const formatLastSeen = (lastSeen: any): { status: string, isOnline: boolean } => {
  if (!lastSeen) return { status: 'Offline', isOnline: false };

  const date = new Date(lastSeen);
  if (isNaN(date.getTime())) {
    return { status: 'Offline', isOnline: false };
  }

  const diffSeconds = (new Date().getTime() - date.getTime()) / 1000;

  if (diffSeconds < 60) {
    return { status: 'Online', isOnline: true };
  }
  return { status: `Active ${formatDistanceToNowStrict(date, { addSuffix: true })}`, isOnline: false };
};

export function UserActivityList() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('lastSeen', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: UserProfile[] = [];
      snapshot.forEach(doc => {
        fetchedUsers.push(toPlainObject({ ...doc.data(), uid: doc.id }) as UserProfile);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      const aStatus = formatLastSeen(a.lastSeen);
      const bStatus = formatLastSeen(b.lastSeen);
      if (aStatus.isOnline && !bStatus.isOnline) return -1;
      if (!aStatus.isOnline && bStatus.isOnline) return 1;
      // If both online or both offline, sort by lastSeen date descending
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
  }, [users]);


  if (loading) {
    return (
        <Card className="w-full h-full shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> User Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full h-full shadow-md flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> User Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
            {sortedUsers.map(user => {
                const { status, isOnline } = formatLastSeen(user.lastSeen);
                return (
                    <div key={user.uid} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                         <div className="relative">
                            <Avatar>
                                <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'}/>
                                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"/>}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{user.username}</p>
                            <p className={cn("text-xs", isOnline ? "text-green-400" : "text-muted-foreground")}>{status}</p>
                        </div>
                    </div>
                )
            })}
            </div>
          </ScrollArea>
      </CardContent>
    </Card>
  );
}
