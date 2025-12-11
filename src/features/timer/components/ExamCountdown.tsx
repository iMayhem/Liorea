"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Target } from 'lucide-react';

interface ExamCountdownProps {
  examName: string;
  targetDate: Date;
}

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft: { [key: string]: number } = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

export default function ExamCountdown({ examName, targetDate }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);


  // Fixed Type Definition here
  const timerComponents: React.ReactNode[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl font-bold font-mono tracking-wider">
            {String(timeLeft[interval as keyof typeof timeLeft] ?? '00').padStart(2, '0')}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/50">{interval}</span>
      </div>
    );
  });

  if (!isClient) return null;

  return (
    <Card className="glass-panel text-white w-full rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2 glass-panel-light">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-white/80">
          <Target className="text-accent w-4 h-4" />
          {examName} Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        {timerComponents.length ? (
            <div className="flex justify-between items-center px-2">
                {timerComponents}
            </div>
        ) : (
          <p className="text-center text-sm font-semibold text-accent">The exam has started!</p>
        )}
      </CardContent>
    </Card>
  );
}