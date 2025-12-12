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

export default function BottomControlBar() {
    const { studyUsers, leaderboardUsers, leaveSession } = usePresence();
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
                <div className="flex items-center gap-3">
                    {/* Sound Controls */}
                    <SoundscapeMixer sounds={sounds} sidebarMode={false} />

                    {/* Leaderboard */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-[#313338] text-zinc-400 hover:text-yellow-400 transition-colors">
                                <Trophy className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-[#313338] border-t-[#1F2023] text-zinc-100 h-[80vh]">
                            <SheetHeader>
                                <SheetTitle className="text-zinc-100">Leaderboard</SheetTitle>
                                <SheetDescription className="text-zinc-400">Top students by focus time.</SheetDescription>
                            </SheetHeader>
                            <div className="py-3 space-y-8 h-full overflow-y-auto">
                                <Leaderboard users={leaderboardUsers} />
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
