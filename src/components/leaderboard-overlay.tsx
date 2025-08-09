// src/components/leaderboard-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/lib/types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, endOfDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaderboard } from '@/components/leaderboard';
import { useStudyRoom } from '@/hooks/use-study-room';

type LeaderboardData = UserProfile[];
type LeaderboardType = 'study-hours-daily' | 'study-hours-all-time';

function LeaderboardContent() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = React.useState<Record<string, UserProfile>>({});
  const [studyLogs, setStudyLogs] = React.useState<Record<string, Record<string, number>>>({});
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardData>([]);
  const [loading, setLoading] = React.useState(true);
  const [leaderboardType, setLeaderboardType] = React.useState<LeaderboardType>('study-hours-daily');
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  // Effect to fetch all users and listen for updates
  React.useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData: Record<string, UserProfile> = {};
      snapshot.forEach((doc) => {
        usersData[doc.id] = { uid: doc.id, ...doc.data() } as UserProfile;
      });
      setAllUsers(usersData);
    });
    return () => unsubscribeUsers();
  }, []);

  // Effect to fetch all study logs and listen for updates
  React.useEffect(() => {
    const logsQuery = query(collection(db, 'studyLogs'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData: Record<string, Record<string, number>> = {};
      snapshot.forEach((doc) => {
        logsData[doc.id] = doc.data().daily || {};
      });
      setStudyLogs(logsData);
    });
    return () => unsubscribeLogs();
  }, []);

  // Effect to process and sort leaderboard data when users or logs change
  React.useEffect(() => {
    if (Object.keys(allUsers).length === 0) {
      setLoading(false); // If no users, stop loading
      return;
    };

    setLoading(true);
    let processedUsers: UserProfile[];

    if (leaderboardType === 'study-hours-all-time') {
      processedUsers = Object.values(allUsers).sort((a, b) => (b.totalStudyHours || 0) - (a.totalStudyHours || 0));
    } else { // daily
      const now = new Date();
      const dayStart = startOfDay(now);
      const dayEnd = endOfDay(now);

      processedUsers = Object.values(allUsers).map(userProfile => {
        const userLogs = studyLogs[userProfile.uid] || {};
        let dailyHours = 0;
        for (const dateStr in userLogs) {
          const logDate = new Date(dateStr);
          if (logDate >= dayStart && logDate <= dayEnd) {
            dailyHours += userLogs[dateStr];
          }
        }
        return { ...userProfile, dailyStudyHours: dailyHours };
      }).sort((a, b) => (b.dailyStudyHours || 0) - (a.dailyStudyHours || 0))
       .map(user => ({...user, totalStudyHours: user.dailyStudyHours || 0}));
    }
    
    setLeaderboardData(processedUsers);
    
    if(user && allUsers[user.uid]){
      const currentUserData = processedUsers.find(p => p.uid === user.uid);
      setUserProfile(currentUserData || allUsers[user.uid]);
    }
    
    setLoading(false);
  }, [allUsers, studyLogs, leaderboardType, user]);


  return (
    <Card className="w-full max-w-2xl bg-transparent border-0 shadow-none">
        <Tabs value={leaderboardType} onValueChange={(value) => setLeaderboardType(value as LeaderboardType)} className="w-full">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Rankings</CardTitle>
                    <CardDescription>
                        {leaderboardType === 'study-hours-daily' ? "Today's leaderboard resets at midnight." : "All-time study champions."}
                    </CardDescription>
                </div>
                <TabsList>
                    <TabsTrigger value="study-hours-daily">Daily</TabsTrigger>
                    <TabsTrigger value="study-hours-all-time">All-Time</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <Leaderboard
                users={leaderboardData}
                currentUser={userProfile}
                />
            )}
            </CardContent>
        </Tabs>
    </Card>
  );
}


export function LeaderboardOverlay() {
    const { isLeaderboardOpen, setIsLeaderboardOpen } = useStudyRoom();

    return (
        <AnimatePresence>
        {isLeaderboardOpen && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            >
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10"
                onClick={() => setIsLeaderboardOpen(false)}
            >
                <X className="h-8 w-8" />
                <span className="sr-only">Close Leaderboard</span>
            </Button>

            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl h-[90vh] max-h-[700px] flex items-center justify-center text-white"
            >
                <LeaderboardContent />
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    );
}
