"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ExamCountdownProps {
    title: string;
    targetDate: Date;
}

export default function ExamCountdown({ title, targetDate }: ExamCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // Use theme variables from globals.css
    // card: primary/5 or card/50
    const cardClass = "bg-primary/5 border-primary/20 text-foreground";
    const iconMetaClass = "bg-primary/10 text-primary group-hover:bg-primary/20";

    if (!timeLeft) {
        return (
            <Card className={`relative overflow-hidden backdrop-blur-md border ${cardClass} p-4 flex flex-col items-center justify-center gap-2 h-32 w-full animate-in fade-in zoom-in`}>
                <h3 className="font-bold text-lg">{title}</h3>
                <span className="text-sm opacity-80">Exam Started / Ended</span>
            </Card>
        );
    }

    return (
        <Card className={`relative overflow-hidden backdrop-blur-md border ${cardClass} p-4 flex flex-col gap-3 w-full shadow-lg hover:shadow-xl transition-all duration-300 group`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg transition-colors ${iconMetaClass}`}>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-base tracking-wide">{title}</span>
                </div>
                <div className="text-[10px] font-mono opacity-60 bg-primary/10 px-2 py-0.5 rounded-full">
                    {targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
                <TimeUnit value={timeLeft.days} label="DAYS" />
                <TimeUnit value={timeLeft.hours} label="HRS" />
                <TimeUnit value={timeLeft.minutes} label="MIN" />
                <TimeUnit value={timeLeft.seconds} label="SEC" />
            </div>
        </Card>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center bg-primary/5 rounded-lg py-1.5">
            <span className="text-lg font-bold font-mono leading-none tracking-tight">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] opacity-60 font-medium mt-0.5">{label}</span>
        </div>
    );
}
