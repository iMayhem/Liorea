// src/app/study-together/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Users, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SharedPomodoroTimer } from '@/components/shared-pomodoro-timer';
import { CollaborativeNotepad } from '@/components/collaborative-notepad';
import { GroupChat } from '@/components/group-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudyRoom } from '@/hooks/use-study-room';
import { ChatIcon } from '@/components/icons';

const PUBLIC_ROOM_ID = "public-study-room-v1";

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


  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID Copied!",
      description: "You can now share it with your friends.",
    });
  };

  if (authLoading || isJoining || !roomData || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div 
        className="flex flex-col h-screen"
    >
      <AppHeader />
      <header className="border-b shrink-0 bg-background/80">
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
             <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsPrivateChatOpen(true)}>
                    <ChatIcon className="mr-2 h-4 w-4" />
                    Private Chat
                </Button>
                <Button variant="outline" onClick={handleCopyRoomId}>
                    <Clipboard className="mr-2 h-4 w-4"/>
                    Copy Room ID
                </Button>
            </div>
         </div>
      </header>
      <main className="flex-1 overflow-auto pb-24" style={{transform: 'scale(0.8)', transformOrigin: 'top center'}}>
        <div className="container mx-auto h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Timer & Sounds */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center gap-6">
                {roomData.timerState && <SharedPomodoroTimer timerState={roomData.timerState} onUpdate={handleTimerUpdate} participants={participants} />}
            </motion.div>
            
            {/* Middle Column: Notepad */}
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

            {/* Right Column: Chat */}
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
