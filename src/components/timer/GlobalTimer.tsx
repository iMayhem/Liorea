
"use client";

import { useGlobalTimer } from "@/context/GlobalTimerContext";
import { cn } from "@/lib/utils";

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
    
    const radius = 80;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    // Animate over 1 hour
    const hourProgress = (elapsedTime % 3600) / 3600;
    const strokeDashoffset = circumference - hourProgress * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center w-52 h-52">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-muted/20"
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
                 <div className="font-mono text-4xl font-bold text-white tracking-tighter">
                    <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                </div>
                <div className="text-sm uppercase text-muted-foreground tracking-widest">
                    Session Time
                </div>
            </div>
        </div>
    );
}
