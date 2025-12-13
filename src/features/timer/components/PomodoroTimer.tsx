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
      <div className="text-center mb-8 space-y-1">
        <h2 className="text-blue-500 font-black tracking-widest text-lg uppercase">Global Session</h2>
        <p className="text-white/50 text-xs font-medium">Syncs automatically every 50 mins</p>
      </div>

      <div className="relative group cursor-pointer" onClick={toggleTimer}>
        {/* Ring Glow Effect (Subtle) */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <svg className="transform -rotate-90 w-72 h-72 relative z-10">
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * ((100 - progress) / 100)}
            className="text-blue-500 transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-6xl font-medium text-white tracking-tight tabular-nums relative top-[-4px]">
            {formatTime(secondsLeft)}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-white/40">
            <RefreshCw className={`w-3 h-3 ${isActive ? 'animate-spin-slow' : ''}`} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Time Remaining</span>
          </div>
        </div>

        {/* Hover Controls Hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-30">
          {isActive ? <Pause className="w-12 h-12 text-white fill-white" /> : <Play className="w-12 h-12 text-white fill-white" />}
        </div>
      </div>

      {/* Hidden reset for continuity if needed, or just double-click ring? Stick to simple click toggle for now. */}
    </div>
  );
}
