import { Button } from '@/components/ui/button';
import { usePresence } from '@/features/study';
import { Users, LogOut, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Leaderboard } from '@/features/study';
import { XPProgressBar } from '@/features/gamification/components/XPProgressBar';
import { StreakIndicator } from '@/features/gamification/components/StreakIndicator';
import { Timer } from 'lucide-react';
import SoundscapeMixer from '@/components/controls/SoundscapeMixer';
import { sounds } from '@/lib/sounds';

interface BottomControlBarProps {
    onTimerClick?: () => void;
    isTimerMode?: boolean;
}

export default function BottomControlBar({ onTimerClick, isTimerMode }: BottomControlBarProps) {
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

                    {/* Timer Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onTimerClick}
                        className={`rounded-full w-9 h-9 transition-colors ${isTimerMode
                                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                : "hover:bg-[#313338] text-zinc-400 hover:text-red-400"
                            }`}
                    >
                        <Timer className="w-5 h-5" />
                    </Button>

                    {/* Shop - Moved to Main Header */}

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
