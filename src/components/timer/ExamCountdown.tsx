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
        <span className="text-2xl font-bold">
            {String(timeLeft[interval as keyof typeof timeLeft] ?? '00').padStart(2, '0')}
        </span>
      </div>
    );
  });

  if (!isClient) {
      return (
        <Card className="border-none shadow-none bg-black/5 backdrop-blur-sm text-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="text-accent w-4 h-4" />
              {examName} Countdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-4 gap-2 text-center h-[44px]">
              {/* Placeholder for server render */}
            </div>
          </CardContent>
        </Card>
      );
  }

  return (
    <Card className="border-none shadow-none bg-black/5 backdrop-blur-sm text-white">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="text-accent w-4 h-4" />
          {examName} Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {timerComponents.length ? (
            <div className="grid grid-cols-4 gap-2 text-center">
                {timerComponents}
            </div>
        ) : (
          <p className="text-center text-sm font-semibold text-accent">The exam has started!</p>
        )}
      </CardContent>
    </Card>
  );
}
