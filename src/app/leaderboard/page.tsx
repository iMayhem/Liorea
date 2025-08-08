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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

type LeaderboardData = UserProfile[];
type LeaderboardType = 'study-hours-weekly' | 'study-hours-all-time';

function PrivacySettingsDialog({
  currentVisibility,
  onSave,
}: {
  currentVisibility: 'anonymous' | 'visible' | 'hidden';
  onSave: (visibility: 'anonymous' | 'visible' | 'hidden') => void;
}) {
  const [selectedValue, setSelectedValue] = React.useState(currentVisibility);

  const handleSave = () => {
    onSave(selectedValue);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Privacy Settings</DialogTitle>
        <CardDescription>
          Choose how you want to appear on the leaderboard.
        </CardDescription>
      </DialogHeader>
      <CardContent className="p-0 pt-4">
        <RadioGroup
          defaultValue={currentVisibility}
          onValueChange={(value) =>
            setSelectedValue(value as 'anonymous' | 'visible' | 'hidden')
          }
          className="gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="visible" id="r1" />
            <Label htmlFor="r1">Show my username</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anonymous" id="r2" />
            <Label htmlFor="r2">Appear as anonymous</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hidden" id="r3" />
            <Label htmlFor="r3">Hide me from the leaderboard</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave}>Save</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardData>([]);
  const [loading, setLoading] = React.useState(true);
  const [leaderboardType, setLeaderboardType] = React.useState<LeaderboardType>('study-hours-all-time');
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

  const handleSavePrivacy = async (
    visibility: 'anonymous' | 'visible' | 'hidden'
  ) => {
    if (!user) return;
    await updateUserProfile(user.uid, { leaderboardVisibility: visibility });
    setUserProfile((prev) =>
      prev ? { ...prev, leaderboardVisibility: visibility } : null
    );
    // Refetch data to apply visibility changes
    const data = await getLeaderboardData(leaderboardType);
    setLeaderboardData(data);
    toast({
      title: 'Success',
      description: 'Your privacy settings have been updated.',
    });
  };

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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Privacy
                </Button>
              </DialogTrigger>
              {userProfile && (
                <PrivacySettingsDialog
                  currentVisibility={userProfile.leaderboardVisibility}
                  onSave={handleSavePrivacy}
                />
              )}
            </Dialog>
          </div>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>
                Filter by study hours (more filters coming soon!)
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
