
"use client";

import { useGlobalTimer } from "@/context/GlobalTimerContext";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

export default function GlobalTimer() {
    const { elapsedTime } = useGlobalTimer();

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        };
    };

    const { hours, minutes, seconds } = formatTime(elapsedTime);
    
    const radius = 120;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    // Animate over 1 hour (3600 seconds)
    const hourProgress = (elapsedTime % 3600) / 3600;
    const strokeDashoffset = circumference - hourProgress * circumference;

    return (
        <Card className="bg-black/20 backdrop-blur-md border border-white/30 text-white w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-white/90">Global Session</h2>
                    <p className="text-xs text-white/60">Syncs automatically every 60 mins</p>
                </div>
                <div className="relative flex flex-col items-center justify-center w-64 h-64">
                    <svg
                        height={radius * 2}
                        width={radius * 2}
                        className="-rotate-90"
                    >
                        <circle
                            className="text-white/10"
                            stroke="currentColor"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <circle
                            className="text-accent"
                            stroke="currentColor"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <div className="font-mono text-6xl font-bold text-white tracking-tighter">
                            <span>{minutes}</span>:<span>{seconds}</span>
                        </div>
                        <div className="text-sm uppercase text-white/60 tracking-widest">
                            Time Remaining
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
