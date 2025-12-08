
"use client";

import { Button } from '@/components/ui/button';
import SoundscapeMixer from './SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { useGlobalTimer } from '@/context/GlobalTimerContext';
import { usePresence } from '@/context/PresenceContext';
import { Clock, Users, LogOut, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Leaderboard from '../study/Leaderboard';
import StudyGrid from '../study/StudyGrid';


export default function ControlPanel() {
  const { elapsedTime } = useGlobalTimer();
  const { onlineUsers } = usePresence();
  const router = useRouter();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleLeave = () => {
    router.push('/home');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="bg-black/30 backdrop-blur-md border-t border-white/20 shadow-lg">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-6 text-sm text-white/80">
                 <div className="flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedTime)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{onlineUsers.length}</span>
                 </div>
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white rounded-full">
                            <Trophy className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-black/30 backdrop-blur-xl border-r-white/20 text-white w-[380px] sm:w-[540px] pt-10">
                        <SheetHeader>
                        <SheetTitle>Study Hall</SheetTitle>
                        <SheetDescription>
                            See who's online and check the leaderboard.
                        </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-8">
                           <StudyGrid users={onlineUsers} />
                           <Leaderboard users={onlineUsers} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            
            <div className="flex-1 flex justify-center">
                <SoundscapeMixer sounds={sounds} />
            </div>

            <div>
                <Button variant="destructive" size="sm" onClick={handleLeave} className="bg-red-600/80 hover:bg-red-600 text-white rounded-full px-4">
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
