// src/components/live-study-list.tsx
'use client';

import * as React from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Music } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function LiveStudyList() {
  const [liveUsers, setLiveUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'users'), where('status.isStudying', '==', true));
    const unsubscribeStudy = onSnapshot(q, (querySnapshot) => {
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        setLiveUsers(current => [...current.filter(u => !u.status?.isStudying), ...users]);
        setLoading(false);
    });

    const qJam = query(collection(db, 'users'), where('status.isJamming', '==', true));
    const unsubscribeJam = onSnapshot(qJam, (querySnapshot) => {
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        setLiveUsers(current => [...current.filter(u => !u.status?.isJamming), ...users]);
        setLoading(false);
    });

    return () => {
        unsubscribeStudy();
        unsubscribeJam();
    };
  }, []);

  const studyingUsers = React.useMemo(() => liveUsers.filter(u => u.status?.isStudying), [liveUsers]);
  const jammingUsers = React.useMemo(() => liveUsers.filter(u => u.status?.isJamming), [liveUsers]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
        ) : liveUsers.length > 0 ? (
          <div className="space-y-4">
              {studyingUsers.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">
                        <span className="font-bold text-primary">{studyingUsers.length}</span> {studyingUsers.length === 1 ? 'student is' : 'students are'} studying now.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <AnimatePresence>
                        {studyingUsers.map((user) => (
                          <motion.div
                            key={user.uid}
                            layout
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                         <Avatar>
                                            <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'} />
                                            <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{user.username} is studying</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                </div>
              )}
               {jammingUsers.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">
                        <span className="font-bold text-primary">{jammingUsers.length}</span> {jammingUsers.length === 1 ? 'person is' : 'people are'} in a Jamnight.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <AnimatePresence>
                        {jammingUsers.map((user) => (
                          <motion.div
                            key={user.uid}
                            layout
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                         <Avatar className="border-2 border-purple-500">
                                            <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'} />
                                            <AvatarFallback className="text-purple-500"><Music className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{user.username} is jamming</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                </div>
              )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No one is currently in a live session. Be the first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}