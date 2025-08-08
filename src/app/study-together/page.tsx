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
import { Loader2, PlusCircle, LogIn, Globe, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp, collection, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useStudyRoom } from '@/hooks/use-study-room';
import { RoomParticipantCounter } from '@/components/room-participant-counter';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const PUBLIC_ROOM_ID = "public-study-room-v1";

interface PrivateRoom {
    id: string;
    createdAt: any;
}

export default function StudyTogetherPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { joinRoom } = useStudyRoom();
  const [roomId, setRoomId] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const [isJoiningPublic, setIsJoiningPublic] = React.useState(false);
  const { toast } = useToast();
  const [privateRooms, setPrivateRooms] = React.useState<PrivateRoom[]>([]);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's private rooms
  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'studyRooms'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms: PrivateRoom[] = [];
        snapshot.forEach((doc) => {
            rooms.push({ id: doc.id, ...doc.data() } as PrivateRoom);
        });
        setPrivateRooms(rooms);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateRoom = async () => {
    if (!user) return;
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
        activeSound: 'none',
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

  const doJoinRoom = async (id: string) => {
    const roomRef = doc(db, 'studyRooms', id);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      router.push(`/study-together/${id}`);
    } else {
      if (id === PUBLIC_ROOM_ID) {
          await setDoc(roomRef, {
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
            activeSound: 'none',
          });
          router.push(`/study-together/${id}`);
      } else {
        toast({
            title: 'Room Not Found',
            description: "The Room ID you entered doesn't exist. Please check the ID and try again.",
            variant: 'destructive',
        });
      }
    }
  }
  
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user) return;
    setIsJoining(true);
    try {
       await doJoinRoom(roomId.trim());
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

  const handleJoinPublicRoom = async () => {
    if (!user) return;
    setIsJoiningPublic(true);
     try {
       await doJoinRoom(PUBLIC_ROOM_ID);
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

  const handleDeleteRoom = async (roomIdToDelete: string) => {
    setIsDeleting(roomIdToDelete);
    try {
        const roomRef = doc(db, 'studyRooms', roomIdToDelete);
        
        // Delete subcollections (like chats) first
        const chatCollectionRef = collection(db, 'studyRooms', roomIdToDelete, 'chats');
        const chatSnapshot = await getDocs(chatCollectionRef);
        const deletePromises = chatSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Delete the room document itself
        await deleteDoc(roomRef);

        toast({
            title: "Room Deleted",
            description: "The study room has been successfully deleted.",
        });
    } catch (error) {
        console.error("Error deleting room:", error);
        toast({
            title: 'Error',
            description: 'Could not delete the room. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsDeleting(null);
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
        
        {privateRooms.length > 0 && (
            <div className="w-full max-w-md mt-4">
                <h2 className="text-2xl font-heading mb-4 text-center">Your Private Rooms</h2>
                <div className="space-y-4">
                    {privateRooms.map(room => (
                        <Card key={room.id}>
                            <CardHeader>
                                <CardTitle className="text-lg truncate">Room ID: {room.id}</CardTitle>
                            </CardHeader>
                            <CardFooter className="flex justify-between">
                                <Button asChild>
                                    <Link href={`/study-together/${room.id}`}>Join Room</Link>
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isDeleting === room.id}>
                                            {isDeleting === room.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the study room and all its data.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
