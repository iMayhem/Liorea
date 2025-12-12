import { Button } from '@/components/ui/button';
import SoundscapeMixer from './SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { usePresence } from '@/features/study';
import { Users, LogOut, Trophy, Mic, MicOff, Settings, Home, BookOpen, ShoppingBag, Timer } from 'lucide-react';
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
import { PomodoroTimer } from '@/features/timer';
import { XPProgressBar } from '@/features/gamification/components/XPProgressBar';
import { StreakIndicator } from '@/features/gamification/components/StreakIndicator';
import { useState } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SidebarControlPanel() {
    const { studyUsers, leaderboardUsers, leaveSession, username } = usePresence();
    const router = useRouter();
    const [isMuted, setIsMuted] = useState(false); // Mock state for now

    // In a real app, you might want to confirm before leaving
    const handleLeave = () => {
        leaveSession();
        router.push('/home');
    };

    return (
        <div className="fixed left-0 top-[72px] bottom-0 w-16 z-20 flex flex-col items-center py-6 bg-[#1E1F22] border-r border-[#111214] hidden md:flex">
            {/* Top: Navigation / Logo */}
            <div className="flex flex-col gap-4 mb-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full bg-[#313338] text-green-500 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                <BookOpen className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>Study Room</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="h-[2px] w-8 bg-zinc-700/50 rounded-full mx-auto" />

                {/* Level Indicator */}
                <XPProgressBar variant="compact" />

                {/* Streak */}
                <StreakIndicator />
            </div>

            {/* Middle: Controls */}
            <div className="flex-1 flex flex-col gap-4 items-center w-full px-2 overflow-y-auto no-scrollbar">
                {/* User Count */}
                <div className="flex flex-col items-center gap-1 text-zinc-400 text-[10px] font-bold">
                    <div className="bg-[#313338] p-2 rounded-xl group hover:border-green-500/50 border border-transparent transition-all">
                        <Users className="w-5 h-5 group-hover:text-green-400" />
                    </div>
                    <span>{studyUsers.length}</span>
                </div>

                {/* Shop */}
                <Link href="/shop" className="cursor-pointer">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-[#313338] hover:text-indigo-400 rounded-[16px] w-12 h-12 transition-all relative">
                                    <ShoppingBag className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>Item Shop</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Link>

                {/* Timer */}
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="cursor-pointer">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-[#313338] hover:text-red-400 rounded-[16px] w-12 h-12 transition-all">
                                            <Timer className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right"><p>Pomodoro Timer</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#313338] border-r-[#1F2023] text-zinc-100 w-[380px] pt-10">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100">Focus Timer</SheetTitle>
                            <SheetDescription className="text-zinc-400">Stay productive with the Pomodoro technique.</SheetDescription>
                        </SheetHeader>
                        <div className="py-8 flex justify-center">
                            <PomodoroTimer />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Leaderboard */}
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="cursor-pointer">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-[#313338] hover:text-yellow-400 rounded-[16px] w-12 h-12 transition-all">
                                            <Trophy className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right"><p>Leaderboard</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#313338] border-r-[#1F2023] text-zinc-100 w-[380px] sm:w-[540px] pt-10">
                        <SheetHeader>
                            <SheetTitle className="text-zinc-100">Leaderboard</SheetTitle>
                            <SheetDescription className="text-zinc-400">Top students by focus time.</SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-8">
                            <Leaderboard users={leaderboardUsers} currentUsername={username} />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Sound Mixer - We might need to adjust SoundscapeMixer to fit in sidebar or be a popover? 
             Actually SoundscapeMixer is a dropdown/popover usually. Let's see. 
             Assuming SoundscapeMixer renders a trigger button. */}
                <SoundscapeMixer sounds={sounds} sidebarMode />

            </div>

            {/* Bottom: User Actions */}
            <div className="flex flex-col gap-4 items-center">
                <div className="h-[2px] w-8 bg-zinc-700/50 rounded-full mx-auto" />

                {/* Leave */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleLeave} className="text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-[16px] w-12 h-12 transition-all">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>Leave Room</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
