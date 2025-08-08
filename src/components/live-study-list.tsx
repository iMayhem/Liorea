// src/components/live-study-list.tsx
'use client';

import * as React from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';
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
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setLiveUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          Live Study Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
        ) : liveUsers.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-4 text-sm">
                You're not alone. <span className="font-bold text-primary">{liveUsers.length}</span> {liveUsers.length === 1 ? 'student is' : 'students are'} studying with you now.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {liveUsers.map((user) => (
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
                                <p>{user.username}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">
            No one is currently in a study session. Be the first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
