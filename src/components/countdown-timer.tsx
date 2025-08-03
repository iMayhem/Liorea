// src/components/countdown-timer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft | null => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft: TimeLeft | null = null;

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

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Set initial time left on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
        <div className="text-center p-4">
            <h2 className="text-xl font-bold font-heading">The exam date has passed!</h2>
        </div>
    );
  }

  return (
    <div className="p-2 rounded-lg bg-card border border-border/50 shadow-lg">
      <h2 className="text-md font-bold text-center mb-2 font-heading tracking-tight">NEET 2026 Countdown</h2>
      <div className="grid grid-cols-4 gap-2 text-center">
        <Card className="bg-secondary/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xl font-bold">{String(timeLeft.days).padStart(2, '0')}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs text-muted-foreground">Hours</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</CardTitle>

          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs text-muted-foreground">Seconds</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}