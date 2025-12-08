"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    // Calculate initial time left only on the client
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);


  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-3xl font-bold">
            {String(timeLeft[interval as keyof typeof timeLeft] ?? '00').padStart(2, '0')}
        </span>
        <span className="text-xs uppercase text-muted-foreground">{interval}</span>
      </div>
    );
  });

  if (!isClient) {
      return (
        <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="text-accent" />
              {examName} Countdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-4 gap-2 text-center h-[52px]">
              {/* Placeholder for server render */}
            </div>
          </CardContent>
        </Card>
      );
  }

  return (
    <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="text-accent" />
          {examName} Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {timerComponents.length ? (
            <div className="grid grid-cols-4 gap-2 text-center">
                {timerComponents}
            </div>
        ) : (
          <p className="text-center text-lg font-semibold text-accent">The exam has started!</p>
        )}
      </CardContent>
    </Card>
  );
}
