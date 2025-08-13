// src/app/study-together/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { SharedPomodoroTimer } from '@/components/shared-pomodoro-timer';
import { CollaborativeNotepad } from '@/components/collaborative-notepad';
import { GroupChat } from '@/components/group-chat';
import { useStudyRoom } from '@/hooks/use-study-room';
import { StudyRoomHeader } from '@/components/study-room-header';


export default function StudyRoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = React.use(params as any);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { 
      joinRoom, 
      roomData, 
      chatMessages, 
      participants, 
      handleTimerUpdate, 
      handleNotepadChange, 
      handleSendMessage, 
      handleTyping, 
      userHasLeftRef,
      notepads,
      activeNotepadId,
      handleNotepadNameChange,
      cycleNotepad,
      claimNotepad,
      setIsPrivateChatOpen
  } = useStudyRoom(roomId);
  
  const [isJoining, setIsJoining] = React.useState(true);


  React.useEffect(() => {
    if (authLoading) return;
    if (!user || !profile?.username) {
        if(!user) router.push('/login');
        else if(!profile?.username) router.push('/set-username');
        return;
    }

    const performJoin = async () => {
        setIsJoining(true);
        const success = await joinRoom(roomId);
        if (!success && !userHasLeftRef.current) {
            toast({
                title: "Room not found",
                description: "This study room does not exist.",
                variant: "destructive"
            });
            router.push('/study-together');
        }
        setIsJoining(false);
    }

    performJoin();

  }, [roomId, user, profile, authLoading, router, toast, joinRoom, userHasLeftRef]);


  if (authLoading || isJoining || !roomData || !user) {
    return (
      <div className="flex flex-col h-screen">
        <StudyRoomHeader />
        <div className="flex-1 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <StudyRoomHeader />
      <main className="flex-1 overflow-auto pb-4">
        <div className="container mx-auto h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center gap-6">
                {roomData.timerState && <SharedPomodoroTimer timerState={roomData.timerState} onUpdate={handleTimerUpdate} participants={participants} />}
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="h-full flex flex-col min-h-[400px] lg:min-h-0">
                    <CollaborativeNotepad 
                    activeNotepadId={activeNotepadId}
                    notepad={notepads[activeNotepadId]}
                    onContentChange={handleNotepadChange}
                    onNameChange={handleNotepadNameChange}
                    onCycleNotepad={cycleNotepad}
                    onClaimNotepad={claimNotepad}
                />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="h-full flex flex-col min-h-[400px] lg:min-h-0">
                    <GroupChat 
                    messages={chatMessages} 
                    onSendMessage={handleSendMessage} 
                    currentUserId={user!.uid} 
                    onTyping={handleTyping}
                    typingUsers={roomData.typingUsers || {}}
                />
            </motion.div>
        </div>
      </main>
    </div>
  );
}
