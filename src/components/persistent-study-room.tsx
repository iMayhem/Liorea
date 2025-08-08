// src/components/persistent-study-room.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { Users, PhoneOff, Clock, ExternalLink, Volume2, VolumeX, CloudRain, Flame, Eye, ScreenShare, ScreenShareOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { Slider } from './ui/slider';
import { AnimatePresence, motion } from 'framer-motion';

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function PersistentStudyRoomBar() {
  const { 
      currentRoomId, 
      leaveRoom, 
      roomData, 
      displayTime, 
      participants, 
      volume, 
      setVolume, 
      isMuted, 
      setIsMuted, 
      handleSoundChange, 
      activeSound, 
      setIsFocusMode,
      isScreenSharing,
      toggleScreenShare
  } = useStudyRoom();

  if (!currentRoomId || !roomData) {
    return null;
  }

  const hasActiveSound = activeSound && activeSound !== 'none';

  return (
    <AnimatePresence>
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-2"
        >
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-primary font-mono">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(displayTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{participants.length} Participants</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={isScreenSharing ? 'secondary' : 'ghost'} size="icon" onClick={toggleScreenShare}>
                                        {isScreenSharing ? <ScreenShareOff className="h-5 w-5"/> : <ScreenShare className="h-5 w-5"/>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setIsFocusMode(true)}>
                                        <Eye className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Focus Mode</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeSound === 'rain' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'rain' ? 'none' : 'rain')}>
                                        <CloudRain className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Rain Sound</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeSound === 'fire' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'fire' ? 'none' : 'fire')}>
                                        <Flame className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Fire Sound</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {hasActiveSound && (
                            <div className="flex items-center gap-2 w-24">
                                <button onClick={() => setIsMuted(!isMuted)}>
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

                    <div className="flex items-center gap-2">
                         <Button asChild variant="outline" size="sm">
                            <Link href={`/study-together/${currentRoomId}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Room
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={leaveRoom}>
                            <PhoneOff className="mr-2 h-4 w-4" />
                            Leave Room
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
  );
}
