// src/app/study-together/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Users, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimerState, ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SharedPomodoroTimer } from '@/components/shared-pomodoro-timer';
import { CollaborativeNotepad } from '@/components/collaborative-notepad';
import { GroupChat } from '@/components/group-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export default function StudyRoomPage({ params: paramsProp }: { params: { roomId: string } }) {
  const params = React.use(paramsProp as any);
  const { roomId } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [roomExists, setRoomExists] = React.useState<boolean | null>(null);
  const [timerState, setTimerState] = React.useState<TimerState | null>(null);
  const [notepadContent, setNotepadContent] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [participants, setParticipants] = React.useState<any[]>([]);

  // Subscribe to room data
  React.useEffect(() => {
    if (!user || !roomId) return;

    const roomRef = doc(db, 'studyRooms', roomId);

    const joinRoomAndSubscribe = async () => {
        const docSnap = await getDoc(roomRef);

        if (docSnap.exists()) {
            setRoomExists(true);
            // Add user to participants list upon joining
            await updateDoc(roomRef, {
                participants: arrayUnion({ uid: user.uid, username: user.username, photoURL: user.photoURL })
            });

            // Now, set up the listeners
            const unsubscribeRoom = onSnapshot(roomRef, (snap) => {
                const data = snap.data();
                if (data) {
                    setTimerState(data.timerState);
                    setNotepadContent(data.notepadContent);
                    setParticipants(data.participants || []);
                }
            });

            const chatQuery = query(collection(db, 'studyRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));
            const unsubscribeChat = onSnapshot(chatQuery, (querySnapshot) => {
                const messages: ChatMessage[] = [];
                querySnapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
                });
                setChatMessages(messages);
            });
            
            setLoading(false);

            // Cleanup function to be returned
            return () => {
                updateDoc(roomRef, {
                    participants: arrayRemove({ uid: user.uid, username: user.username, photoURL: user.photoURL })
                });
                unsubscribeRoom();
                unsubscribeChat();
            };

        } else {
            setRoomExists(false);
            setLoading(false);
            toast({
                title: "Room not found",
                description: "This study room does not exist.",
                variant: "destructive"
            });
            router.push('/study-together');
            return () => {}; // Return empty cleanup
        }
    };

    let cleanup = () => {};
    joinRoomAndSubscribe().then(cleanupFn => {
        if (cleanupFn) {
            cleanup = cleanupFn;
        }
    });

    // Final cleanup on component unmount
    return () => {
        cleanup();
    };

  }, [roomId, user, router, toast]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID Copied!",
      description: "You can now share it with your friends.",
    });
  };

  const handleTimerUpdate = async (newState: Partial<TimerState>) => {
    const roomRef = doc(db, 'studyRooms', roomId);
    await updateDoc(roomRef, { timerState: { ...timerState, ...newState } });
  };
  
  const handleNotepadChange = async (content: string) => {
    const roomRef = doc(db, 'studyRooms', roomId);
    await updateDoc(roomRef, { notepadContent: content });
  };
  
  const handleSendMessage = async (message: string) => {
    if (!user) return;
    const chatCollectionRef = collection(db, 'studyRooms', roomId, 'chats');
    await addDoc(chatCollectionRef, {
      text: message,
      senderId: user.uid,
      senderName: user.username,
      timestamp: serverTimestamp(),
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!roomExists) {
    // This state is handled by the redirect in the useEffect, but as a fallback:
     return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Room not found.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <header className="border-b">
         <div className="container mx-auto py-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold font-heading">Study Room</h1>
                 <TooltipProvider>
                  <div className="flex -space-x-2 overflow-hidden">
                    {participants.map((p) => (
                      <Tooltip key={p.uid}>
                        <TooltipTrigger asChild>
                            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                              <AvatarImage src={p.photoURL || `https://placehold.co/40x40.png`} alt={p.username}/>
                              <AvatarFallback>{p.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{p.username}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
            </div>
            <Button variant="outline" onClick={handleCopyRoomId}>
                <Clipboard className="mr-2 h-4 w-4"/>
                Copy Room ID
            </Button>
         </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Timer */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center">
                {timerState && <SharedPomodoroTimer timerState={timerState} onUpdate={handleTimerUpdate} />}
            </motion.div>
            
            {/* Middle Column: Notepad */}
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="h-full flex flex-col">
                <CollaborativeNotepad content={notepadContent} onContentChange={handleNotepadChange} />
            </motion.div>

            {/* Right Column: Chat */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="h-full flex flex-col">
                 <GroupChat messages={chatMessages} onSendMessage={handleSendMessage} currentUserId={user!.uid} />
            </motion.div>
        </div>
      </main>
    </div>
  );
}
