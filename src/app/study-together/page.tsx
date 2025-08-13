// src/app/study-together/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, LogIn, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { RoomParticipantCounter } from '@/components/room-participant-counter';

const PUBLIC_ROOM_ID = "public-study-room-v1";

export default function StudyTogetherPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [roomId, setRoomId] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const [isJoiningPublic, setIsJoiningPublic] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleCreateRoom = async () => {
    if (!user || !profile) return;
    if (profile.isBlocked) {
        toast({ title: 'Action Denied', description: 'You are blocked from creating rooms.', variant: 'destructive' });
        return;
    }
    setIsCreating(true);
    try {
      const newRoomRef = doc(collection(db, 'studyRooms'));
      await setDoc(newRoomRef, {
        ownerId: user.uid, // Add ownerId
        createdAt: serverTimestamp(),
        notepads: {
          collaborative: { name: 'Collaborative', content: 'Welcome to the study room!\n\nThis is a shared notepad.', owner: null },
          notepad1: { name: 'Notepad 1', content: '', owner: null },
          notepad2: { name: 'Notepad 2', content: '', owner: null },
        },
        timerState: {
          mode: 'study',
          time: 25 * 60,
          isActive: false,
          startTime: null,
          studyDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        },
        participants: [],
        typingUsers: {},
      });
      router.push(`/study-together/${newRoomRef.id}`);
    } catch (error) {
      console.error("Error creating room: ", error);
      toast({
        title: 'Error',
        description: 'Failed to create a new room. Please try again.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const doJoinPublicRoom = async (id: string) => {
     if (!user || !profile) return;
    if (profile.isBlocked) {
        toast({ title: 'Action Denied', description: 'You are blocked from joining rooms.', variant: 'destructive' });
        return;
    }
    const roomRef = doc(db, 'studyRooms', id);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      router.push(`/study-together/${id}`);
    } else {
      await setDoc(roomRef, {
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        notepads: {
            collaborative: { name: 'Collaborative', content: 'Welcome to the Public Study Room!', owner: null },
            notepad1: { name: 'Notepad 1', content: '', owner: null },
            notepad2: { name: 'Notepad 2', content: '', owner: null },
        },
        timerState: {
          mode: 'study', time: 25 * 60, isActive: false, startTime: null,
          studyDuration: 25, shortBreakDuration: 5, longBreakDuration: 15,
        },
        participants: [],
        typingUsers: {},
      });
      router.push(`/study-together/${id}`);
    }
  }
  
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user) return;
    setIsJoining(true);
    // Directly navigate to the room page without checking if it exists.
    // The room page itself will handle non-existent rooms.
    router.push(`/study-together/${roomId.trim()}`);
  };

  const handleJoinPublicRoom = async () => {
    if (!user) return;
    setIsJoiningPublic(true);
     try {
       await doJoinPublicRoom(PUBLIC_ROOM_ID);
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
      <main className="flex-1 container mx-auto p-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-8"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-heading">Study Together</CardTitle>
              <CardDescription>Create a private room or join the public one to study with others.</CardDescription>
              <RoomParticipantCounter />
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
              <Button onClick={handleCreateRoom} className="w-full" variant="outline" disabled={isCreating}>
                {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Private Room
              </Button>
              
              <form onSubmit={handleJoinRoom} className="space-y-4 pt-6">
                 <div className="space-y-2">
                    <Label htmlFor="room-id">Room ID</Label>
                    <Input
                        id="room-id"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                    />
                 </div>
                <Button type="submit" variant="secondary" className="w-full" disabled={isJoining}>
                    {isJoining ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Join Room
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
