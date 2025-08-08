// src/components/persistent-study-room.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { Users, PhoneOff, Clock, MessageSquare, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { PersistentAmbientSound } from './persistent-ambient-sound';
import { Slider } from './ui/slider';

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function PersistentStudyRoomBar() {
  const { currentRoomId, leaveRoom, roomData, displayTime, participants, volume, setVolume, isMuted, setIsMuted } = useStudyRoom();

  const hasActiveSound = roomData?.activeSound && roomData.activeSound !== 'none';

  return (
    <>
    <PersistentAmbientSound />
    <AnimatePresence>
      {currentRoomId && roomData && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sticky bottom-0 left-0 right-0 z-50"
        >
            <div className="container mx-auto p-2">
                <div className="bg-card border border-border/50 rounded-lg shadow-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                             <p className="text-sm font-bold font-heading">Study Room</p>
                             <p className="text-xs text-muted-foreground">{currentRoomId === 'public-study-room-v1' ? 'Public Room' : 'Private Room'}</p>
                        </div>
                         <TooltipProvider>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <Users className="h-4 w-4" />
                                 <span>{participants.length}</span>
                            </div>
                         </TooltipProvider>

                         <div className="flex items-center gap-2 text-sm text-primary font-mono">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(displayTime)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveSound && (
                             <div className="flex items-center gap-2">
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
                                    className="w-24"
                                />
                            </div>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button asChild size="icon" variant="ghost">
                                        <Link href={`/study-together/${currentRoomId}`}>
                                             <MessageSquare className="h-5 w-5"/>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Open Chat & Notepad</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="destructive" onClick={leaveRoom}>
                                        <PhoneOff className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Leave Room</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
