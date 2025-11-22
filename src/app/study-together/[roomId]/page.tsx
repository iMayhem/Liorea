'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SharedPomodoroTimer } from '@/components/shared-pomodoro-timer';
import { GroupChat } from '@/components/group-chat';
import { useStudyRoom } from '@/hooks/use-study-room';
import { AppHeader } from '@/components/header';
import { StudyRoomFooter } from '@/components/study-room-footer';

export default function StudyRoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = React.use(params as any);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { 
      joinRoom, 
      roomData, 
      currentRoomId,
      chatMessages, 
      timerState,
      handleSendMessage, 
  } = useStudyRoom();
  
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login');
        return;
    }

    const init = async () => {
        if (currentRoomId !== roomId) {
            await joinRoom(roomId);
        }
        setIsInitializing(false);
    };
    
    init();
  }, [roomId, user, authLoading, currentRoomId, joinRoom, router]);


  if (authLoading || isInitializing || !roomData) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-transparent">
      <AppHeader />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0 pb-20">
            {/* Left Column: Big Timer */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="flex flex-col items-center justify-center h-full"
            >
                <SharedPomodoroTimer timerState={timerState} />
            </motion.div>
            
            {/* Right Column: Chat */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }} 
                className="h-full min-h-[400px] flex flex-col"
            >
                <GroupChat 
                    messages={chatMessages} 
                    onSendMessage={handleSendMessage} 
                    currentUserId={user!.uid} 
                    onTyping={() => {}}
                    typingUsers={{}}
                />
            </motion.div>
        </div>
      </main>
      <StudyRoomFooter />
    </div>
  );
}