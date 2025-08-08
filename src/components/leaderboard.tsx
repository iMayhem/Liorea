// src/components/leaderboard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'border-yellow-400 text-yellow-400';
    case 2:
      return 'border-gray-400 text-gray-400';
    case 3:
      return 'border-amber-600 text-amber-600';
    default:
      return 'border-border';
  }
};

const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

export function Leaderboard({ users, currentUser }: LeaderboardProps) {
  const topUsers = users.slice(0, 10);
  const currentUserRank = users.findIndex(u => u.uid === currentUser?.uid) + 1;

  // Check if current user is in the top 10 already
  const isCurrentUserInTop10 = topUsers.some(u => u.uid === currentUser?.uid);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        {topUsers.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.uid === currentUser?.uid;
          const displayName = user.leaderboardVisibility === 'anonymous' ? `User#${user.uid.slice(0, 5)}` : (user.username || 'Anonymous');
          
          return (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'flex items-center justify-between p-3 transition-all',
                  getRankColor(rank),
                  { 'bg-primary/10': isCurrentUser }
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex w-10 items-center justify-center font-bold text-lg">
                    {rank === 1 ? (
                      <Crown className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <span>{rank}</span>
                    )}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.photoURL || ''} alt={displayName} />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{displayName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-lg text-primary">
                    {formatStudyTime(user.totalStudyHours || 0)}
                  </p>
                  {/* Rank movement indicator can be added later */}
                   <Minus className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
       {!isCurrentUserInTop10 && currentUser && currentUserRank > 0 && (
         <>
          <div className="my-4 text-center text-muted-foreground">...</div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="flex items-center justify-between p-3 bg-primary/10 border-primary">
                    <div className="flex items-center gap-4">
                    <span className="flex w-10 items-center justify-center font-bold text-lg">{currentUserRank}</span>
                    <Avatar>
                        <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.username || 'You'} />
                        <AvatarFallback>{currentUser.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{currentUser.username} (You)</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <p className="font-bold text-lg text-primary">{formatStudyTime(currentUser.totalStudyHours || 0)}</p>
                        <Minus className="h-4 w-4 text-muted-foreground" />
                    </div>
                </Card>
            </motion.div>
         </>
      )}

      {users.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No one is on the leaderboard yet. Start a study session to get ranked!
        </p>
      )}
    </div>
  );
}
