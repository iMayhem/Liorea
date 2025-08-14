// src/app/watch-together/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

const PUBLIC_WATCH_TOGETHER_ROOM_ID = "public-watch-together-room-v1";

export default function WatchTogetherPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [isJoiningPublic, setIsJoiningPublic] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const doJoinPublicRoom = async () => {
     if (!user || !profile) return;
    if (profile.isBlocked) {
        toast({ title: 'Action Denied', description: 'You are blocked from joining rooms.', variant: 'destructive' });
        return;
    }
    const roomRef = doc(db, 'watchTogetherRooms', PUBLIC_WATCH_TOGETHER_ROOM_ID);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      router.push(`/watch-together/${PUBLIC_WATCH_TOGETHER_ROOM_ID}`);
    } else {
      await setDoc(roomRef, {
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            currentVideoId: 'jfKfPfyJRdk', // A default video
            participants: [],
            typingUsers: {},
      });
      router.push(`/watch-together/${PUBLIC_WATCH_TOGETHER_ROOM_ID}`);
    }
  }

  const handleJoinPublicRoom = async () => {
    if (!user) return;
    setIsJoiningPublic(true);
    try {
        await doJoinPublicRoom();
    } catch (error) {
        console.error("Error joining public room: ", error);
        toast({
            title: 'Error',
            description: 'Could not join the public room. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsJoiningPublic(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-heading">Watch Together</CardTitle>
              <CardDescription>Join the public room to watch and listen to YouTube videos in sync with your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleJoinPublicRoom} className="w-full" disabled={isJoiningPublic}>
                {isJoiningPublic ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Globe className="mr-2 h-4 w-4" />
                )}
                Join Public Room
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
