// src/app/leaderboard/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/leaderboard';
import { getLeaderboardData, getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LeaderboardData = UserProfile[];
type LeaderboardType = 'study-hours-weekly' | 'study-hours-all-time';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardData>([]);
  const [loading, setLoading] = React.useState(true);
  const [leaderboardType, setLeaderboardType] = React.useState<LeaderboardType>('study-hours-weekly');
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user) {
      const fetchLeaderboard = async () => {
        setLoading(true);
        const data = await getLeaderboardData(leaderboardType);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setLeaderboardData(data);
        setLoading(false);
      };
      fetchLeaderboard();
    }
  }, [user, leaderboardType]);


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
                See who's topping the charts.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                Filter by weekly study hours (more filters coming soon!)
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
