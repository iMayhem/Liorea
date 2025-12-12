import { Button } from '@/components/ui/button';
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
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SoundscapeMixer from '@/components/controls/SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { XPProgressBar } from '@/features/gamification/components/XPProgressBar';
import { StreakIndicator } from '@/features/gamification/components/StreakIndicator';
import { PomodoroTimer } from '@/features/timer';
import { ShoppingBag, Timer } from 'lucide-react';
import Link from 'next/link';

export default function BottomControlBar() {
    const { studyUsers, leaderboardUsers, leaveSession, username } = usePresence();
    const router = useRouter();

    const handleLeave = () => {
        leaveSession();
        router.push('/home');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1F22] border-t border-[#111214]">
            <div className="flex items-center justify-between px-4 py-3">

                {/* LEFT: User Count */}
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-200 font-bold text-sm">{studyUsers.length}</span>
                </div>

                {/* CENTER: Controls */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Level & Streak (Compact) */}
                    <div className="flex items-center gap-2 mr-2">
                        <XPProgressBar variant="compact" />
                        <StreakIndicator />
                    </div>

                    {/* Timer */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-[#313338] text-zinc-400 hover:text-red-400 transition-colors">
                                <Timer className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-[#313338] border-t-[#1F2023] text-zinc-100 h-auto pb-10">
                            <SheetHeader>
                                <SheetTitle className="text-zinc-100 text-center">Focus Timer</SheetTitle>
                                <SheetDescription className="text-zinc-400 text-center">Stay productive with the Pomodoro technique.</SheetDescription>
                            </SheetHeader>
                            <div className="py-6 flex justify-center">
                                <PomodoroTimer />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Shop */}
                    <Link href="/shop">
                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-[#313338] text-zinc-400 hover:text-indigo-400 transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                        </Button>
                    </Link>

                    {/* Sound Controls */}
                    <SoundscapeMixer sounds={sounds} sidebarMode={false} />

                    {/* Leaderboard */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-[#313338] text-zinc-400 hover:text-yellow-400 transition-colors">
                                <Trophy className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-[#313338] border-r-[#1F2023] text-zinc-100 w-[85vw] sm:w-[540px] pt-10">
                            <SheetHeader>
                                {/* Accessibile Hidden Title if needed, or just visual header */}
                            </SheetHeader>
                            <div className="py-2 h-[calc(100vh-80px)]">
                                <Leaderboard users={leaderboardUsers} currentUsername={username} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* RIGHT: Leave Button */}
                <Button
                    onClick={handleLeave}
                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md px-3 py-2 transition-all font-medium text-sm gap-2 h-9"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Leave</span>
                </Button>

            </div>
        </div>
    );
}
