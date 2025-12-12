"use client";

import { useGamification } from "../context/GamificationContext";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { LEVEL_FORMULA } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function XPProgressBar({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
    const { stats } = useGamification();

    // Calculate progress
    const currentLevel = stats.level;
    const nextLevel = currentLevel + 1;
    const xpForCurrentLevel = 50 * Math.pow(currentLevel - 1, 2);
    const xpForNextLevel = 50 * Math.pow(nextLevel - 1, 2);
    const levelSpan = xpForNextLevel - xpForCurrentLevel;
    const currentProgress = stats.xp - xpForCurrentLevel;
    const percentage = Math.min(100, Math.max(0, (currentProgress / levelSpan) * 100));

    if (variant === 'compact') {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="relative w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full border border-yellow-500/30 cursor-pointer overflow-hidden group">
                            {/* Background Progress Fill (Vertical) */}
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-yellow-500/20 transition-all duration-500"
                                style={{ height: `${percentage}%` }}
                            />
                            <span className="relative z-10 font-bold text-yellow-500 text-xs">
                                {stats.level}
                            </span>
                            <div className="absolute inset-0 border-2 border-yellow-500/0 group-hover:border-yellow-500/50 rounded-full transition-all" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#1e1f22] border-zinc-800 p-3">
                        <div className="min-w-[150px]">
                            <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
                                <span className="font-bold text-yellow-500 flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-yellow-500" />
                                    Level {stats.level}
                                </span>
                                <span>{Math.floor(currentProgress)} / {Math.floor(levelSpan)} XP</span>
                            </div>
                            <Progress
                                value={percentage}
                                className="h-2.5 bg-yellow-500/10 border border-yellow-500/10"
                                indicatorClassName="bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            />
                            <div className="text-[10px] text-zinc-500 mt-1 text-center">
                                {Math.floor(levelSpan - currentProgress)} XP to next level
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="flex flex-col gap-1 w-full max-w-[140px]">
            <div className="flex justify-between items-center text-xs text-zinc-400">
                <span className="font-bold text-yellow-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-yellow-500" />
                    Lvl {stats.level}
                </span>
                <span>{Math.floor(stats.xp)} XP</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
