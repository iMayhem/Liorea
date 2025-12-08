"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Video, Music, Wand2, Trophy } from 'lucide-react';
import VideoSelector from './VideoSelector';
import SoundscapeMixer from './SoundscapeMixer';
import WorkspaceSuggester from '@/components/ai/WorkspaceSuggester';
import Leaderboard from '@/components/study/Leaderboard';
import { videos, type Video as VideoType } from '@/lib/videos';
import { sounds } from '@/lib/sounds';

type User = {
  id: number;
  name: string;
  avatarImageId: string;
  studyTime: number; // in minutes
};

interface ControlPanelProps {
  onVideoSelect: (url: string) => void;
  onSuggestionSelect: (videoUrl: string) => void;
  leaderboardUsers: User[];
}

export default function ControlPanel({ onVideoSelect, onSuggestionSelect, leaderboardUsers }: ControlPanelProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full">
              <Video />
              <span className="sr-only">Select Environment</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-background/90 backdrop-blur-xl border-t text-foreground">
            <SheetHeader>
              <SheetTitle>Select Environment</SheetTitle>
            </SheetHeader>
            <VideoSelector videos={videos} onSelect={onVideoSelect} />
          </SheetContent>
        </Sheet>
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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white bg-primary/30 hover:bg-primary/50 hover:text-white rounded-full">
              <Wand2 />
              <span className="sr-only">Get a Suggestion</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/90 backdrop-blur-xl w-full md:w-[400px] text-foreground">
            <SheetHeader>
              <SheetTitle>Get a Workspace Suggestion</SheetTitle>
            </SheetHeader>
            <WorkspaceSuggester onSuggestionSelect={onSuggestionSelect} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
