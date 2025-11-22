// src/components/leaderboard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface LeaderboardProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  viewType: any; // Simplified for quick fix
}

const formatStudyTime = (seconds: number) => {
    if (isNaN(seconds) || !seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

export function Leaderboard({ users, currentUser }: LeaderboardProps) {
  const topUsers = users.slice(0, 10);
  
  return (
    <div className="w-full space-y-4">
      <ScrollArea className="h-[calc(80vh-150px)] pr-4">
        <div className="space-y-2">
          {topUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.uid === currentUser?.uid;
            let displayName = user.username || `User ${index+1}`;
            
            return (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn('p-3 flex items-center justify-between', isCurrentUser && 'bg-primary/10 border-primary')}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-lg text-muted-foreground">{rank}</div>
                      <Avatar>
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{displayName}</span>
                    </div>
                    <span className="font-mono font-bold text-primary">{formatStudyTime(user.totalStudyHours)}</span>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {users.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No study data yet. Be the first!</p>
        )}
      </ScrollArea>
    </div>
  );
}