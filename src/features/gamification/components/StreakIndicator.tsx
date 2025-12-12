"use client";

import { useGamification } from "../context/GamificationContext";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function StreakIndicator() {
    const { stats } = useGamification();

    if (stats.current_streak === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors cursor-help">
                        <Flame className="w-4 h-4 fill-orange-500/50 animate-pulse" />
                        <span className="font-bold text-sm tabular-nums">{stats.current_streak}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1e1f22] border-zinc-800 text-zinc-300">
                    <p className="font-bold text-orange-400 mb-1">Daily Streak</p>
                    <p className="text-xs">Study every day to keep the flame lit!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
