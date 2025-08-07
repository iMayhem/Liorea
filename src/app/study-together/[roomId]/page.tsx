// src/app/study-together/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove, getDoc, DocumentData, Timestamp, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Users, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimerState, ChatMessage, Participant, AnimationType } from '@/lib/types';
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
import { SyncedAnimation } from '@/components/synced-animation';

const ANIMATION_MAP: Record<string, AnimationType> = {
    '🌧️': 'rain', '😢': 'rain', '😭': 'rain',
    '🔥': 'fire', '❤️‍🔥': 'fire', '🥵': 'fire',
    '❄️': 'snow', '🥶': 'snow', '☃️': 'snow',
    '🎉': 'confetti', '🥳': 'confetti', '🎊': 'confetti',
    '✨': 'stars', '⭐': 'stars', '🌟': 'stars',
};


export default function StudyRoomPage({ params: paramsProp }: { params: { roomId: string } }) {
  const params = React.use(paramsProp as any);
  const { roomId } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [roomData, setRoomData] = React.useState<DocumentData | null>(null);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const userHasLeftRef = React.useRef(false);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login');
        return;
    }
  
    const roomRef = doc(db, 'studyRooms', roomId);
  
    const joinAndSubscribe = async () => {
      try {
        const docSnap = await getDoc(roomRef);
    
        if (!docSnap.exists()) {
          toast({
            title: "Room not found",
            description: "This study room does not exist.",
            variant: "destructive"
          });
          router.push('/study-together');
          return;
        }
        
        const newParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
        await updateDoc(roomRef, {
          participants: arrayUnion(newParticipant)
        });
    
        const unsubscribeRoom = onSnapshot(roomRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setRoomData(data);
            setParticipants(data.participants || []);
          } else {
             if (!userHasLeftRef.current) {
              toast({ title: "Room Closed", description: "The study room was deleted.", variant: "destructive" });
              router.push('/study-together');
             }
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
    
        return () => {
          unsubscribeRoom();
          unsubscribeChat();
        };
      } catch (error) {
          console.error("Failed to join room:", error);
          toast({ title: "Error", description: "Could not join the study room.", variant: "destructive" });
          router.push('/study-together');
      }
    };
  
    let cleanupPromise = joinAndSubscribe();
  
    const handleLeave = async () => {
        if (user && !userHasLeftRef.current) {
            userHasLeftRef.current = true; // Prevent multiple leave operations
            const roomRef = doc(db, 'studyRooms', roomId);

            // Remove user from typing list on leave
            const currentTypingUsers = roomData?.typingUsers || {};
            if (currentTypingUsers[user.uid]) {
                delete currentTypingUsers[user.uid];
                await updateDoc(roomRef, { typingUsers: currentTypingUsers });
            }

            // Check if user is the last one
            const currentParticipants = (await getDoc(roomRef)).data()?.participants || [];
            if(currentParticipants.length <= 1 && currentParticipants[0]?.uid === user.uid) {
                // Delete subcollections and then the room document
                const deleteRoom = async () => {
                    const chatRef = collection(db, 'studyRooms', roomId, 'chats');
                    const chatSnapshot = await getDocs(chatRef);
                    const batch = writeBatch(db);
                    chatSnapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    batch.delete(roomRef);
                    await batch.commit();
                }
                deleteRoom();

            } else {
                 const userParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
                 await updateDoc(roomRef, {
                    participants: arrayRemove(userParticipant)
                }).catch(err => console.error("Error removing participant:", err));
            }
        }
         if (cleanupPromise) {
            const cleanup = await cleanupPromise;
            if(cleanup) cleanup();
        }
    }


    return () => {
      handleLeave();
    };
  }, [roomId, user, authLoading, router, toast]);
  

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID Copied!",
      description: "You can now share it with your friends.",
    });
  };

  const handleTimerUpdate = async (newState: Partial<TimerState>) => {
    if (!roomData) return;
    const roomRef = doc(db, 'studyRooms', roomId);
    await updateDoc(roomRef, { timerState: { ...roomData.timerState, ...newState } });
  };
  
  const handleNotepadChange = async (content: string) => {
    const roomRef = doc(db, 'studyRooms', roomId);
    await updateDoc(roomRef, { notepadContent: content });
  };
  
  const handleSendMessage = async (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => {
    if (!user) return;
    const roomRef = doc(db, 'studyRooms', roomId);
    const chatCollectionRef = collection(roomRef, 'chats');
    
    if(!message.text && !message.imageUrl) return;

    const messageData: any = {
      text: message.text,
      imageUrl: message.imageUrl || null,
      senderId: user.uid,
      senderName: user.username,
      timestamp: serverTimestamp(),
      reactions: {},
    };

    if (replyTo) {
      messageData.replyToId = replyTo.id;
      messageData.replyToText = replyTo.text;
    }
    
    await addDoc(chatCollectionRef, messageData);
  };
  
  const handleReaction = async (messageId: string, emoji: string) => {
      if (!user) return;
      const roomRef = doc(db, 'studyRooms', roomId);
      const messageRef = doc(collection(roomRef, 'chats'), messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
          const messageData = messageDoc.data();
          const reactions = messageData.reactions || {};
          const usersForEmoji = reactions[emoji] || [];

          if (usersForEmoji.includes(user.uid)) {
              // User has already reacted with this emoji, so remove reaction
              reactions[emoji] = usersForEmoji.filter((id: string) => id !== user.uid);
              if(reactions[emoji].length === 0) delete reactions[emoji];
          } else {
              // Add new reaction
              reactions[emoji] = [...usersForEmoji, user.uid];
          }
          await setDoc(messageRef, { reactions }, { merge: true });
          
          // Trigger synced animation for special emojis
          const animationType = ANIMATION_MAP[emoji];
          if (animationType) {
              await updateDoc(roomRef, {
                  currentAnimation: {
                      type: animationType,
                      timestamp: serverTimestamp()
                  }
              });
          }
      }
  };

  const handleTyping = async (text: string) => {
    if (!user) return;
    const roomRef = doc(db, 'studyRooms', roomId);
    const typingField = `typingUsers.${user.uid}`;

    if (text.trim() !== '') {
        await updateDoc(roomRef, {
            [typingField]: {
                username: user.username,
                text: text,
            }
        });
    } else {
        const currentTypingUsers = roomData?.typingUsers || {};
        if (currentTypingUsers[user.uid]) {
            delete currentTypingUsers[user.uid];
            await updateDoc(roomRef, { typingUsers: currentTypingUsers });
        }
    }
  };

  if (authLoading || loading || !roomData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <SyncedAnimation animation={roomData.currentAnimation} />
      <header className="border-b shrink-0">
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
                              <AvatarImage src={p.photoURL || `https://placehold.co/40x40.png`} alt={p.username || 'User'}/>
                              <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
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
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Timer */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center">
                {roomData.timerState && <SharedPomodoroTimer timerState={roomData.timerState} onUpdate={handleTimerUpdate} participants={participants} />}
            </motion.div>
            
            {/* Middle Column: Notepad */}
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="h-full flex flex-col min-h-[400px] lg:min-h-0">
                <CollaborativeNotepad content={roomData.notepadContent} onContentChange={handleNotepadChange} />
            </motion.div>

            {/* Right Column: Chat */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="h-full flex flex-col min-h-[400px] lg:min-h-0">
                 <GroupChat 
                    messages={chatMessages} 
                    onSendMessage={handleSendMessage} 
                    currentUserId={user!.uid} 
                    onReaction={handleReaction}
                    onTyping={handleTyping}
                    typingUsers={roomData.typingUsers || {}}
                />
            </motion.div>
        </div>
      </main>
    </div>
  );
}
