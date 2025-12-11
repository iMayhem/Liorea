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
      d: Math.floor(difference / (1000 * 60 * 60 * 24)),
      h: Math.floor((difference / (1000 * 60 * 60)) % 24),
      m: Math.floor((difference / 1000 / 60) % 60),
      s: Math.floor((difference / 1000) % 60),
    };
  }
  return { d: 0, h: 0, m: 0, s: 0 };
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
      <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
         <Target className="text-accent w-3 h-3" />
         <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{examName}</span>
      </div>

      {/* Timer Body: Just Numbers */}
      <div className="p-3 flex justify-center items-center gap-1">
        {isExpired ? (
           <div className="w-full text-center text-accent font-bold py-1">Good Luck!</div>
        ) : (
           <div className="flex items-baseline gap-1 font-mono text-xl md:text-2xl font-bold text-white tracking-tight">
              <span>{timeLeft.d}</span>
              <span className="text-white/20 text-sm">:</span>
              <span>{String(timeLeft.h).padStart(2, '0')}</span>
              <span className="text-white/20 text-sm">:</span>
              <span>{String(timeLeft.m).padStart(2, '0')}</span>
              <span className="text-white/20 text-sm">:</span>
              <span>{String(timeLeft.s).padStart(2, '0')}</span>
           </div>
        )}
      </div>
    </GlassCard>
  );
}