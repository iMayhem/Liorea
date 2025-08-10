// src/components/persistent-study-room.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { Users, PhoneOff, Clock, ExternalLink, Volume2, VolumeX, CloudRain, Flame, Eye, Loader2, Coffee, Waves, MessageSquare, Trophy, ImageIcon, RefreshCw, FlameKindling } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { Slider } from './ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatIcon } from './icons';
import { useBackground } from '@/hooks/use-background';
import { cn } from '@/lib/utils';

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
      isLeaving,
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
      setIsPrivateChatOpen,
      setIsLeaderboardOpen,
      hasNewPrivateMessage
  } = useStudyRoom();
  const { changeBackground, isChanging, clearCustomBackground } = useBackground();


  if (!currentRoomId || !roomData) {
    return null;
  }
  
  const handleBackgroundCycleClick = () => {
    clearCustomBackground();
    changeBackground();
  };


  const hasActiveSound = activeSound && activeSound !== 'none';

  return (
    <>
    <AnimatePresence>
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-2"
        >
            <div className="glass-effect flex items-center justify-between gap-4 rounded-lg border p-4 shadow-lg">
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setIsPrivateChatOpen(true)}>
                                    <ChatIcon showDot={hasNewPrivateMessage} className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Private Chat</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={handleBackgroundCycleClick} disabled={isChanging}>
                                    {isChanging ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                                  </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Change Background</p></TooltipContent>
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
                                    <FlameKindling className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Fire Sound</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={activeSound === 'coffee' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'coffee' ? 'none' : 'coffee')}>
                                    <Coffee className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Coffee Shop</p></TooltipContent>
                        </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={activeSound === 'ocean' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSoundChange(activeSound === 'ocean' ? 'none' : 'ocean')}>
                                    <Waves className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ocean Waves</p></TooltipContent>
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
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={leaveRoom} disabled={isLeaving}>
                                    {isLeaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <PhoneOff className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Leave Room</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
    </>
  );
}
