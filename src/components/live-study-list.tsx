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
  const [studyingUsers, setStudyingUsers] = React.useState<UserProfile[]>([]);
  const [jammingUsers, setJammingUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const qStudy = query(collection(db, 'users'), where('status.isStudying', '==', true));
    const unsubscribeStudy = onSnapshot(qStudy, (querySnapshot) => {
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        setStudyingUsers(users);
        setLoading(false);
    });

    const qJam = query(collection(db, 'users'), where('status.isJamming', '==', true));
    const unsubscribeJam = onSnapshot(qJam, (querySnapshot) => {
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        setJammingUsers(users);
        setLoading(false);
    });

    return () => {
        unsubscribeStudy();
        unsubscribeJam();
    };
  }, []);

  if (loading) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-md">
            <CardContent className="p-4">
                 <div className="text-center text-muted-foreground">Loading Live Activity...</div>
            </CardContent>
        </Card>
    )
  }

  // If no one is doing anything, we can still show the structure.
  if (studyingUsers.length === 0 && jammingUsers.length === 0) {
      return (
         <Card className="w-full max-w-2xl mx-auto shadow-md">
             <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <h3 className="text-muted-foreground mb-3 text-sm font-semibold flex items-center gap-2">
                            <Radio className="h-4 w-4 text-green-500" />
                            Studying Now (0)
                        </h3>
                        <p className="text-xs text-muted-foreground">No one is studying right now.</p>
                     </div>
                      <div>
                        <h3 className="text-muted-foreground mb-3 text-sm font-semibold flex items-center gap-2">
                            <Music className="h-4 w-4 text-purple-500" />
                            In a Jamnight (0)
                        </h3>
                        <p className="text-xs text-muted-foreground">No one is jamming right now.</p>
                     </div>
                </div>
            </CardContent>
        </Card>
      )
  }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyingUsers.length > 0 && (
                  <div>
                    <h3 className="text-muted-foreground mb-3 text-sm font-semibold flex items-center gap-2">
                        <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                        Studying Now ({studyingUsers.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
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
               <div>
                    <h3 className="text-muted-foreground mb-3 text-sm font-semibold flex items-center gap-2">
                        <Music className="h-4 w-4 text-purple-500" />
                        In a Jamnight ({jammingUsers.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
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
                       {jammingUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground">No one is jamming right now.</p>
                       )}
                    </div>
                </div>
          </div>
      </CardContent>
    </Card>
  );
}