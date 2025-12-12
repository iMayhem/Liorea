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

        <div className="w-full">
          <div className="font-mono text-7xl font-bold text-white tracking-tighter mb-4">
            {formatTime(secondsLeft)}
          </div>
          <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={toggleTimer} variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-white/10">
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button onClick={resetTimer} variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-white/10">
            <RefreshCw className="w-6 h-6" />
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
