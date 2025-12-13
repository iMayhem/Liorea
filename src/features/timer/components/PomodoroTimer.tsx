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
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      {/* Red Pill Label */}
      <div className="px-6 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
        <span className="text-red-500 font-bold tracking-widest text-sm uppercase">Focus Time</span>
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center -mt-8">
          <span className="text-2xl font-bold text-white tracking-widest">{formatTime(secondsLeft)}</span>
        </div>

        {/* Buttons Centered Below Time (roughly) - actually layout is: Time Top, Ring?, Buttons Center */}
        {/* Wait, screenshot has Time ABOVE buttons. And buttons are inside? No. */}
        {/* Screenshot: Top "FOCUS TIME". Middle: "25:00". Below that: Play | Reset buttons. */}
        {/* It doesn't actually show a ring in the screenshot, but user said "large circular". */}
        {/* Creating the layout exactly as requested: Badge -> Time -> Buttons -> Toggle */}
      </div>

      {/* Large Controls - Centered */}
      <div className="flex items-center gap-6 mb-12">
        {/* Main Play Button - White Vertical Pill */}
        <Button
          onClick={toggleTimer}
          className="w-16 h-24 rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center transition-transform active:scale-95"
        >
          {isActive ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black ml-1" />}
        </Button>

        {/* Reset Button - Circular Outline */}
        <Button
          onClick={resetTimer}
          variant="outline"
          className="w-16 h-16 rounded-full border-white/10 bg-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
        >
          <RefreshCw className="w-6 h-6" />
        </Button>
      </div>

      {/* Segmented Control Toggle */}
      <div className="flex bg-black/20 p-1 rounded-full border border-white/5">
        <button
          onClick={() => { setMode('work'); setIsActive(false); setSecondsLeft(workMinutes * 60); }}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'work' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => { setMode('break'); setIsActive(false); setSecondsLeft(breakMinutes * 60); }}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
        >
          Break
        </button>
      </div>
    </div>
  );
}
