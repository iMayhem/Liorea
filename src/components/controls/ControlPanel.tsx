"use client";

import { Button } from '@/components/ui/button';
import SoundscapeMixer from './SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { usePresence } from '@/features/study';
import { Users, LogOut, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Leaderboard } from '@/features/study';


export default function ControlPanel() {
  // Grab leaderboardUsers here
  const { studyUsers, leaderboardUsers, leaveSession } = usePresence();
  const router = useRouter();

  const handleLeave = () => {
    leaveSession();
    router.push('/home');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="bg-black/10 backdrop-blur-md border-t border-white/20 shadow-lg">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              {/* Count only ACTIVE users */}
              <span>{studyUsers.length}</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white rounded-full">
                  <Trophy className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black/20 backdrop-blur-xl border-r-white/20 text-white w-[380px] sm:w-[540px] pt-10">
                <SheetHeader>
                  <SheetTitle>Leaderboard (All Time)</SheetTitle>
                  <SheetDescription>
                    Top students by total focus time.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-8">
                  {/* Pass the MERGED leaderboard here */}
                  <Leaderboard users={leaderboardUsers} />
                </div>
              </SheetContent>
            </Sheet>
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