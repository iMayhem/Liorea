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
import { Timer } from 'lucide-react';
import SoundscapeMixer from '@/components/controls/SoundscapeMixer';
import { sounds } from '@/lib/sounds';

interface BottomControlBarProps {
    // Props removed as Timer is gone
}

export default function BottomControlBar({ }: BottomControlBarProps) {
    const { studyUsers, leaderboardUsers, leaveSession, username } = usePresence();
    const router = useRouter();

    const handleLeave = () => {
        leaveSession();
        router.push('/home');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
            <div className="flex items-center justify-between px-4 py-3">

                {/* LEFT: User Count */}
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-bold text-sm">{studyUsers.length}</span>
                </div>

                {/* CENTER: Controls */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Timer Toggle Removed */}




                    {/* Sound Controls */}
                    <SoundscapeMixer sounds={sounds} sidebarMode={false} />



                    {/* Leaderboard */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                <Trophy className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-background border-r-border text-foreground w-[85vw] sm:w-[540px] pt-10 flex flex-col h-full">
                            <SheetHeader className="shrink-0">
                                <SheetTitle className="text-foreground text-left">Leaderboard</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 min-h-0 overflow-hidden py-2">
                                <Leaderboard users={leaderboardUsers} currentUsername={username} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* RIGHT: Leave Button */}
                <Button
                    onClick={handleLeave}
                    className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-md px-3 py-2 transition-all font-medium text-sm gap-2 h-9"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Leave</span>
                </Button>

            </div>
        </div>
    );
};
