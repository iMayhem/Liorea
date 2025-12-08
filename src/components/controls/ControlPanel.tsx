"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Music, Trophy, Image as ImageIcon } from 'lucide-react';
import SoundscapeMixer from './SoundscapeMixer';
import Leaderboard from '@/components/study/Leaderboard';
import { sounds } from '@/lib/sounds';
import { OnlineUser } from '@/context/PresenceContext';
import { useBackground } from '@/context/BackgroundContext';


interface ControlPanelProps {
  leaderboardUsers: OnlineUser[];
}

export default function ControlPanel({ leaderboardUsers }: ControlPanelProps) {
  const { cycleBackground } = useBackground();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full">
              <Music />
              <span className="sr-only">Mix Sounds</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-background/90 backdrop-blur-xl border-t text-foreground">
            <SheetHeader>
              <SheetTitle>Mix Sounds</SheetTitle>
            </SheetHeader>
            <SoundscapeMixer sounds={sounds} />
          </SheetContent>
        </Sheet>
        
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={cycleBackground}>
            <ImageIcon />
            <span className="sr-only">Change Background</span>
        </Button>

        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full">
                    <Trophy />
                    <span className="sr-only">Leaderboard</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background/90 backdrop-blur-xl w-full md:w-[400px] text-foreground">
                <SheetHeader>
                    <SheetTitle>Leaderboard</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <Leaderboard users={leaderboardUsers} />
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
