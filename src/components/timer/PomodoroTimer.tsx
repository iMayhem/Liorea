"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = (isBreak ? breakDuration : workDuration) * 60;
  const timeRemaining = minutes * 60 + seconds;
  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
    }
  }, []);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = useCallback(() => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
  }, [workDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (minutes > 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Could not play notification sound'));
      }
      if (isBreak) {
        setMinutes(workDuration);
        setIsBreak(false);
      } else {
        setMinutes(breakDuration);
        setIsBreak(true);
      }
      setSeconds(0);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, minutes, isBreak, workDuration, breakDuration, timeRemaining]);

  useEffect(() => {
    reset();
  }, [workDuration, breakDuration, reset]);

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/20 text-white w-full max-w-sm mx-auto">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <div className="text-sm font-medium">{isBreak ? 'Break Time' : 'Focus Time'}</div>
        <div className="text-4xl font-mono font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <Progress value={progress} className="w-full h-1 bg-white/20 [&>div]:bg-accent" />
        <div className="flex gap-2">
          <Button onClick={toggle} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10">
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={reset} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-4 items-center text-xs pt-2">
          <div>
            <label htmlFor="work-duration">Work: </label>
            <input id="work-duration" type="number" value={workDuration} onChange={(e) => setWorkDuration(Math.max(1, Number(e.target.value)))} className="w-10 bg-transparent border-b border-white/50 text-center" />
            <span className="ml-1">min</span>
          </div>
          <div>
            <label htmlFor="break-duration">Break: </label>
            <input id="break-duration" type="number" value={breakDuration} onChange={(e) => setBreakDuration(Math.max(1, Number(e.target.value)))} className="w-10 bg-transparent border-b border-white/50 text-center" />
            <span className="ml-1">min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
