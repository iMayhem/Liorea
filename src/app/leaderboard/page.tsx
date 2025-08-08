// src/app/leaderboard/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/leaderboard';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, endOfDay } from 'date-fns';

type LeaderboardData = UserProfile[];
type LeaderboardType = 'study-hours-daily' | 'study-hours-all-time';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = React.useState<Record<string, UserProfile>>({});
  const [studyLogs, setStudyLogs] = React.useState<Record<string, Record<string, number>>>({});
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardData>([]);
  const [loading, setLoading] = React.useState(true);
  const [leaderboardType, setLeaderboardType] = React.useState<LeaderboardType>('study-hours-daily');
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
       .map(user => ({...user, totalStudyHours: user.dailyStudyHours || user.totalStudyHours}));
    }
    
    setLeaderboardData(processedUsers);
    
    if(user && allUsers[user.uid]){
      const currentUserData = processedUsers.find(p => p.uid === user.uid);
      setUserProfile(currentUserData || allUsers[user.uid]);
    }
    
    setLoading(false);
  }, [allUsers, studyLogs, leaderboardType, user]);


  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-8"
        >
          <div className="flex w-full max-w-2xl items-center justify-between">
            <div className="text-left">
              <h1 className="text-4xl font-bold font-heading">Leaderboard</h1>
              <p className="mt-2 text-muted-foreground">
                See who's topping the charts today.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Daily Rankings</CardTitle>
              <CardDescription>
                Today's leaderboard resets at midnight.
              </CardDescription>
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
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
