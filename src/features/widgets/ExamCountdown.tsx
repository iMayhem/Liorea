"use client";

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { GlassCard } from '@/features/ui/GlassCard';

interface ExamCountdownProps {
  examName: string;
  targetDate: Date;
}

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  if (difference > 0) {
    return {
      DAYS: Math.floor(difference / (1000 * 60 * 60 * 24)),
      HOURS: Math.floor((difference / (1000 * 60 * 60)) % 24),
      MINS: Math.floor((difference / 1000 / 60) % 60),
      SECS: Math.floor((difference / 1000) % 60),
    };
  }
  return { DAYS: 0, HOURS: 0, MINS: 0, SECS: 0 };
};

export default function ExamCountdown({ examName, targetDate }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isClient) return null;

  const isExpired = Object.values(timeLeft).every(val => val === 0);

  return (
    <GlassCard variant="panel" noPadding className="w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
         <Target className="text-accent w-4 h-4" />
         <span className="text-xs font-bold uppercase tracking-widest text-white/80">{examName}</span>
      </div>

      {/* Timer Body */}
      <div className="p-4 flex justify-between items-center text-center px-6">
        {isExpired ? (
           <div className="w-full text-center text-accent font-bold py-2">Good Luck!</div>
        ) : (
           Object.entries(timeLeft).map(([label, value]) => (
             <div key={label} className="flex flex-col items-center gap-1 min-w-[3rem]">
               {/* Fixed width and smaller text to prevent layout shifts */}
               <span className="text-xl font-mono font-bold text-white leading-none">
                 {String(value).padStart(2, '0')}
               </span>
               <span className="text-[9px] font-medium text-white/40 tracking-wider">
                 {label}
               </span>
             </div>
           ))
        )}
      </div>
    </GlassCard>
  );
}