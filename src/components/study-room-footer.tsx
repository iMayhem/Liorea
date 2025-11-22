'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { Users, PhoneOff, Clock, Volume2, VolumeX, CloudRain, Eye, Loader2, Coffee, Waves, Trophy, FlameKindling } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from './ui/slider';

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function StudyRoomFooter() {
  const { 
      leaveRoom, 
      isLeaving,
      roomData, 
      participants, 
      volume, 
      setVolume, 
      isMuted, 
      setIsMuted, 
      handleSoundChange, 
      activeSound, 
      setIsFocusMode,
      setIsLeaderboardOpen,
      timerState
  } = useStudyRoom();
  
  const hasActiveSound = activeSound && activeSound !== 'none';

  return (
    <footer className="fixed bottom-0 z-50 w-full border-t bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
            {/* Left: Stats */}
            <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-sm font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timerState.time)}</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{participants.length}</span>
                </div>
            </div>
            
            {/* Center: Controls */}
            <div className="flex items-center justify-center gap-1 md:gap-2">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsLeaderboardOpen(true)}>
                                <Trophy className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Leaderboard</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsFocusMode(true)}>
                                <Eye className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Focus Mode</p></TooltipContent>
                    </Tooltip>
                    
                    <div className="h-6 w-px bg-border mx-2" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={activeSound === 'rain' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'rain' ? 'none' : 'rain')}>
                                <CloudRain className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Rain</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={activeSound === 'fire' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'fire' ? 'none' : 'fire')}>
                                <FlameKindling className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Fire</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={activeSound === 'coffee' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'coffee' ? 'none' : 'coffee')}>
                                <Coffee className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Cafe</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={activeSound === 'ocean' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'ocean' ? 'none' : 'ocean')}>
                                <Waves className="h-5 w-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Ocean</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {hasActiveSound && (
                    <div className="flex items-center gap-2 w-24 ml-2 animate-in fade-in slide-in-from-left-4">
                        <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground">
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <Slider
                            value={[isMuted ? 0 : volume * 100]}
                            onValueChange={(value) => {
                                setIsMuted(false);
                                setVolume(value[0] / 100)
                            }}
                            max={100}
                            step={1}
                            className="flex-1"
                        />
                    </div>
                )}
            </div>

            {/* Right: Exit */}
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={leaveRoom} disabled={isLeaving}>
                                {isLeaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <PhoneOff className="h-4 w-4 mr-2" />}
                                <span className="hidden md:inline">Leave</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Leave Room</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
      </div>
    </footer>
  );
}