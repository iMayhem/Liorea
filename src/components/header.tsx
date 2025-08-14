// src/components/header.tsx
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut, Users, Home, RefreshCw, Image as ImageIcon, Clipboard, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBackground } from "@/hooks/use-background";
import * as React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useStudyRoom } from "@/hooks/use-study-room";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import type { Participant } from "@/lib/types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function AppHeader() {
  const { user, profile, logout } = useAuth();
  const { participants: studyRoomParticipants } = useStudyRoom();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { changeBackground, isChanging, clearCustomBackground } = useBackground();
  const [watchTogetherParticipants, setWatchTogetherParticipants] = React.useState<Participant[]>([]);


  const handleBack = () => {
    router.back();
  };
  
  const handleBackgroundCycleClick = () => {
    // If a custom background is set, the first click clears it.
    // Otherwise, it cycles through the default images.
    clearCustomBackground();
    changeBackground();
  };

  const isStudyRoom = pathname.startsWith('/study-together/');
  const isWatchRoom = pathname.startsWith('/watch-together/');
  const roomId = isStudyRoom || isWatchRoom ? pathname.split('/').pop() : null;

  React.useEffect(() => {
    if (!isWatchRoom || !roomId) {
        setWatchTogetherParticipants([]);
        return;
    }
    const roomRef = doc(db, 'watchTogetherRooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
            setWatchTogetherParticipants(doc.data().participants || []);
        } else {
            setWatchTogetherParticipants([]);
        }
    });
    return () => unsubscribe();
  }, [isWatchRoom, roomId]);
  
  const participants = isStudyRoom ? studyRoomParticipants : watchTogetherParticipants;


  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    toast({
        title: "Room ID Copied!",
        description: "You can now share it with your friends.",
    });
  };
  
  const getHeaderContent = () => {
      if(isStudyRoom || isWatchRoom) {
          return (
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {isStudyRoom && <Users className="h-6 w-6 text-primary" />}
                    {isWatchRoom && <Music className="h-6 w-6 text-primary" />}
                    <span className="font-bold">{isStudyRoom ? "Study Room" : "Watch Together"}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <TooltipProvider>
                    <div className="flex items-center gap-3">
                        {participants.map(p => (
                             <Tooltip key={p.uid}>
                                <TooltipTrigger>
                                     <Avatar>
                                        <AvatarImage src={p.photoURL || ''} alt={p.username || 'User'} />
                                        <AvatarFallback>{p.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{p.username}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                    </TooltipProvider>
                </div>

                 <div className="flex items-center gap-2 shrink-0">
                    {roomId && (
                       <Button variant="outline" size="sm" onClick={handleCopyRoomId}>
                            <Clipboard className="mr-2 h-4 w-4"/>
                            Copy Room ID
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Link>
                    </Button>
                    <Button onClick={logout} variant="outline" size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                </div>
            </div>
          )
      }
      
      return (
         <>
            <div className="mr-4 flex items-center">
              {isHomePage && (
                <Link href="/" className="flex items-center space-x-2">
                  <AppLogo />
                  <span className="font-bold">Liorea</span>
                </Link>
              )}
            </div>
            {profile && <p className="text-sm text-muted-foreground">Signed in as {profile.username}</p>}
            <div className="flex flex-1 items-center justify-end space-x-2">
               {!isHomePage && (
                 <Button onClick={handleBack} variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                 </Button>
               )}
               <Button asChild variant="outline" size="sm">
                  <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                  </Link>
              </Button>
                {user && (
                  <>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/study-together">
                            <Users className="mr-2 h-4 w-4" />
                            Study Together
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleBackgroundCycleClick} disabled={isChanging}>
                        {isChanging ? <RefreshCw className="h-[1.2rem] w-[1.2rem] animate-spin" /> : <ImageIcon className="h-[1.2rem] w-[1.2rem]" />}
                        <span className="sr-only">Change Background</span>
                    </Button>
                    <Button onClick={logout} variant="outline" size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
               )}
            </div>
         </>
      )
  }

  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {getHeaderContent()}
      </div>
    </header>
  );
}
