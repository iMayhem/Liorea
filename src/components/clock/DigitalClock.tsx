"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface DigitalClockProps {
  formatString?: string;
}

export default function DigitalClock({ formatString = 'HH:mm:ss' }: DigitalClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!time) {
    return <div className="text-6xl md:text-8xl font-bold text-white tabular-nums tracking-tighter h-[72px] md:h-[96px]"></div>;
  }

  return (
    <div className="text-6xl md:text-8xl font-bold text-white tabular-nums tracking-tighter" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
      {format(time, formatString)}
    </div>
  );
}
