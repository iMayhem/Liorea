// src/app/jamnight/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function JamnightPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roomId, setRoomId] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleCreateRoom = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const newRoomRef = doc(collection(db, 'jamRooms'));
      // Initialize room with default state
      await setDoc(newRoomRef, {
        createdAt: serverTimestamp(),
        currentVideoId: 'jfKfPfyJRdk', // A default video
        playerState: 'PAUSED',
        lastSeekTimestamp: serverTimestamp(),
        lastSeekTimeSeconds: 0,
        participants: [],
        typingUsers: {}, // Initialize for chat
      });
      router.push(`/jamnight/${newRoomRef.id}`);
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
  
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user) return;
    setIsJoining(true);
    try {
       const roomRef = doc(db, 'jamRooms', roomId.trim());
       const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
            router.push(`/jamnight/${roomId.trim()}`);
        } else {
            toast({
                title: 'Room Not Found',
                description: "The Room ID you entered doesn't exist.",
                variant: 'destructive',
            });
        }
    } catch (error) {
        console.error("Error joining room: ", error);
        toast({
            title: 'Error',
            description: 'Could not join the room. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsJoining(false);
    }
  };

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
              <CardTitle className="text-3xl font-heading">Jamnight</CardTitle>
              <CardDescription>Create or join a room to listen to YouTube songs in sync with your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleCreateRoom} className="w-full" disabled={isCreating}>
                {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Private Room
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or Join a Private Room
                  </span>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4">
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
    