// src/components/persistent-study-room.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { Users, PhoneOff, Clock, ExternalLink, Volume2, VolumeX, CloudRain, Flame, MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { Slider } from './ui/slider';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar, SidebarTrigger } from './ui/sidebar';
import { AppLogo } from './icons';

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function PersistentStudyRoomBar() {
  const { currentRoomId, leaveRoom, roomData, displayTime, participants, volume, setVolume, isMuted, setIsMuted, handleSoundChange, activeSound } = useStudyRoom();
  const { setOpen, state } = useSidebar();

  React.useEffect(() => {
    if (currentRoomId) {
        setOpen(true);
    } else {
        setOpen(false);
    }
  }, [currentRoomId, setOpen]);


  const hasActiveSound = activeSound && activeSound !== 'none';

  if (!currentRoomId || !roomData) {
    return null;
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <AppLogo className="size-6" />
                     <div className="flex flex-col">
                        <span className="text-lg font-semibold tracking-tight">
                            Study Room
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {currentRoomId === 'public-study-room-v1' ? 'Public Room' : 'Private Room'}
                        </span>
                    </div>
                </div>
                <SidebarTrigger className="group-data-[state=expanded]:-rotate-180" />
            </SidebarHeader>

            <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="w-full flex flex-col gap-2 p-2 rounded-lg bg-secondary/50 text-center">
                         <div className="flex items-center justify-center gap-2 text-sm text-primary font-mono">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(displayTime)}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{participants.length} Participants</span>
                        </div>
                    </div>
                </SidebarMenuItem>

                <SidebarGroup>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{children: "Open Chat & Notepad", side:"right"}}>
                             <Link href={`/study-together/${currentRoomId}`}>
                                 <MessageSquare />
                                 <span>Room Details</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            variant={activeSound === 'rain' ? 'secondary' : 'ghost'}
                            onClick={() => handleSoundChange(activeSound === 'rain' ? 'none' : 'rain')}
                             tooltip={{children: "Rain Sound", side:"right"}}
                        >
                            <CloudRain/>
                            <span>Rain</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                         <SidebarMenuButton
                            variant={activeSound === 'fire' ? 'secondary' : 'ghost'}
                            onClick={() => handleSoundChange(activeSound === 'fire' ? 'none' : 'fire')}
                            tooltip={{children: "Fire Sound", side:"right"}}
                        >
                            <Flame />
                            <span>Fire</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarGroup>
                
                {hasActiveSound && (
                    <SidebarGroup>
                        <SidebarMenuItem>
                           <div className="flex items-center gap-2 w-full p-2 group-data-[collapsible=icon]:hidden">
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
                        </SidebarMenuItem>
                    </SidebarGroup>
                )}


                 <SidebarMenuItem className="mt-auto">
                    <SidebarMenuButton onClick={leaveRoom} tooltip={{children: "Leave Room", side:"right"}}>
                        <PhoneOff className="text-destructive"/>
                        <span className="text-destructive">Leave Room</span>
                    </SidebarMenuButton>
                 </SidebarMenuItem>

            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  );
}
