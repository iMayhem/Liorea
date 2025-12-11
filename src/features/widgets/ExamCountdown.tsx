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
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
         <span className="text-sm font-bold uppercase tracking-widest text-white/80">{examName}</span>
      </div>

      {/* Timer Body */}
      <div className="p-4 flex justify-between items-center text-center px-6">
        {isExpired ? (
           <div className="w-full text-center text-accent font-bold py-2">Good Luck!</div>
        ) : (
           Object.entries(timeLeft).map(([label, value]) => (
             <div key={label} className="flex flex-col items-center gap-1">
               <span className="text-2xl font-mono font-bold leading-none">{String(value).padStart(2, '0')}</span>
               <span className="text-[9px] uppercase tracking-wider text-white/40">{label}</span>
             </div>
           ))
        )}
      </div>
    </GlassCard>
  );
}