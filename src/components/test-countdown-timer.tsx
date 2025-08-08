// src/components/test-countdown-timer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Test } from '@/lib/types';
import { parse } from 'date-fns';
import { Skeleton } from './ui/skeleton';


interface TestCountdownTimerProps {
  tests: Test[];
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

const findNextTest = (tests: Test[]): Test | null => {
    const now = new Date();
    // Filter for tests that are in the future and sort them
    const upcomingTests = tests
        .map(test => ({
            ...test,
            // Parse date string into a Date object
            dateObj: parse(test.date, 'MMMM d, yyyy', new Date())
        }))
        .filter(test => test.dateObj > now)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // The next test is the first one in the sorted list
    return upcomingTests.length > 0 ? upcomingTests[0] : null;
}

export function TestCountdownTimer({ tests }: TestCountdownTimerProps) {
  const [nextTest, setNextTest] = useState<Test | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setNextTest(findNextTest(tests));
  }, [tests]);

  useEffect(() => {
    if (!nextTest || !isClient) return;

    const targetDate = parse(nextTest.date, 'MMMM d, yyyy', new Date()).toISOString();
    
    // Set initial time left on client mount
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextTest, isClient]);
  
  if (!isClient) {
    return <Skeleton className="h-[108px] w-full" />;
  }


  if (!nextTest) {
    return (
      <Card className="p-2 flex items-center justify-center h-full min-h-[108px]">
        <h2 className="text-md font-bold text-center font-heading tracking-tight">All tests are complete!</h2>
      </Card>
    );
  }

  if (!timeLeft) {
    return (
      <Card className="p-2 flex items-center justify-center h-full min-h-[108px]">
            <h2 className="text-md font-bold font-heading text-center">Loading next test...</h2>
        </Card>
    );
  }

  return (
    <Card className="p-2">
      <h2 className="text-md font-bold text-center mb-2 font-heading tracking-tight">{nextTest.name}</h2>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">Days</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">Seconds</div>
        </div>
      </div>
    </Card>
  );
}
