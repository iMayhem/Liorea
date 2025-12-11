"use client";

import { Button } from '@/components/ui/button';
import { usePresence } from '@/context/PresenceContext';
import { Users, LogOut, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Leaderboard from '../study/Leaderboard';

// --- NEW IMPORT ---
import SoundMixer from '@/features/audio/SoundMixer';

export default function ControlPanel() {
  const { studyUsers, leaderboardUsers, leaveSession } = usePresence();
  const router = useRouter();

  const handleLeave = () => {
    leaveSession(); 
    router.push('/home'); 
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* Glass Bar */}
      <div className="bg-[#050505]/80 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
            
            {/* Left: User Count */}
            <div className="flex items-center gap-6 text-sm text-white/60">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                    <Users className="w-4 h-4" />
                    <span className="font-mono font-bold text-white">{studyUsers.length}</span>
                    <span className="hidden sm:inline">studying</span>
                 </div>
            </div>
            
            {/* Center: Controls */}
            <div className="flex-1 flex justify-center items-center gap-6">
                
                {/* Leaderboard Toggle */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white rounded-full">
                            <Trophy className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-black/40 backdrop-blur-xl border-r-white/20 text-white w-[380px] sm:w-[540px] pt-10">
                        <SheetHeader>
                            <SheetTitle>Leaderboard</SheetTitle>
                            <SheetDescription>Top students by total focus time.</SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                           <Leaderboard users={leaderboardUsers} />
                        </div>
                    </SheetContent>
                </Sheet>
                
                {/* Separator */}
                <div className="h-6 w-px bg-white/10" />

                {/* The Simplified Sound Mixer */}
                <SoundMixer />
            </div>

            {/* Right: Leave Button */}
            <div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLeave} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full px-4"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}