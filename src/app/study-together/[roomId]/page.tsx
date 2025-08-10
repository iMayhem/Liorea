// src/app/study-together/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Users, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SharedPomodoroTimer } from '@/components/shared-pomodoro-timer';
import { CollaborativeNotepad } from '@/components/collaborative-notepad';
import { GroupChat } from '@/components/group-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudyRoom } from '@/hooks/use-study-room';
import { ChatIcon } from '@/components/icons';
import type { Participant } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);


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
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
        <AppHeader />
        <main className="flex-1 grid grid-cols-[auto_1fr] h-[calc(100vh-theme(height.14))]">
            <motion.div
                animate={{ width: isSidebarOpen ? 256 : 80 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full bg-background/80 border-r border-border p-2 space-y-2"
            >
                <div className="flex items-center justify-between p-2">
                    {isSidebarOpen && <h2 className="text-lg font-semibold text-center">Participants</h2>}
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Users className="h-5 w-5"/>
                    </Button>
                </div>
                 <ScrollArea className="flex-1">
                 <div className="space-y-2">
                    {participants.map((p: Participant) => (
                        <div key={p.uid} className="flex items-center gap-2 p-1 rounded-md">
                           <Avatar>
                                <AvatarImage src={p.photoURL || ''} alt={p.username || 'User'}/>
                                <AvatarFallback>{p.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                           </Avatar>
                           <AnimatePresence>
                           {isSidebarOpen && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-medium text-sm whitespace-nowrap"
                                >
                                    {p.username}
                                </motion.span>
                            )}
                            </AnimatePresence>
                        </div>
                    ))}
                 </div>
            </ScrollArea>
            </motion.div>
            
            <div className="overflow-auto pb-24">
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
            </div>

        </main>
    </div>
  );
}
