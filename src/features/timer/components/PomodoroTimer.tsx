"use client";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RefreshCw } from 'lucide-react';
import * as Tone from 'tone';

import { useGamification } from '@/features/gamification/context/GamificationContext';

export default function PomodoroTimer() {
  const { awardXP } = useGamification();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);

  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    // Initialize synth on the client
    if (typeof window !== 'undefined' && !synth.current) {
      synth.current = new Tone.Synth().toDestination();
    }
  }, []);

  useEffect(() => {
    const newSeconds = (mode === 'work' ? workMinutes : breakMinutes) * 60;
    setSecondsLeft(newSeconds);
  }, [workMinutes, breakMinutes, mode]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft(prevSeconds => {
        if (prevSeconds <= 1) {
          // Play a sound when the timer finishes
          synth.current?.triggerAttackRelease("C5", "8n");

          // Award XP if finishing a work session
          if (mode === 'work') {
            awardXP(workMinutes);
          }

          const nextMode = mode === 'work' ? 'break' : 'work';
          const nextDuration = (nextMode === 'work' ? workMinutes : breakMinutes) * 60;
          setMode(nextMode);
          return nextDuration;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, mode, workMinutes, breakMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setSecondsLeft(workMinutes * 60);
  };

  const totalDuration = (mode === 'work' ? workMinutes : breakMinutes) * 60;
  const progress = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setWorkMinutes(value);
      if (mode === 'work' && !isActive) {
        setSecondsLeft(value * 60);
      }
    }
  };

  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setBreakMinutes(value);
      if (mode === 'break' && !isActive) {
        setSecondsLeft(value * 60);
      }
    }
  };


  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white w-full max-w-sm mx-auto shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 p-6 text-center">
        <h2 className="text-lg font-semibold uppercase tracking-wider text-white/80">Focus Time</h2>

        {/* Circular Progress Clock */}
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-64 h-64">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * ((100 - progress) / 100)}
              className="text-white transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-mono text-6xl font-bold text-white tracking-tighter">
              {formatTime(secondsLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <Button onClick={toggleTimer} variant="ghost" className="w-16 h-16 rounded-full hover:bg-white/10 bg-white text-black hover:text-white transition-colors flex items-center justify-center">
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </Button>
          <Button onClick={resetTimer} variant="ghost" className="w-12 h-12 rounded-full hover:bg-white/10 border border-white/20 text-white/70 hover:text-white flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <label htmlFor="work-duration">Work:</label>
            <Input
              id="work-duration"
              type="number"
              value={workMinutes}
              onChange={handleWorkChange}
              className="w-14 h-8 bg-transparent border-0 border-b rounded-none text-center focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isActive}
            />
            <span>min</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="break-duration">Break:</label>
            <Input
              id="break-duration"
              type="number"
              value={breakMinutes}
              onChange={handleBreakChange}
              className="w-14 h-8 bg-transparent border-0 border-b rounded-none text-center focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isActive}
            />
            <span>min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
