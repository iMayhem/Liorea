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


  // Determine Color Theme based on mode
  const themeColor = mode === 'work' ? 'text-red-500' : 'text-emerald-500';
  const ringColor = mode === 'work' ? 'text-red-500' : 'text-emerald-500';
  const glowColor = mode === 'work' ? 'bg-red-500/10' : 'bg-emerald-500/10';
  const strokeColor = mode === 'work' ? 'stroke-red-500' : 'stroke-emerald-500';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] select-none">

      {/* Top Pill - Mode Indicator */}
      <div className={`px-6 py-2 rounded-full ${mode === 'work' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border mb-8 transition-colors duration-500`}>
        <span className={`${themeColor} font-bold tracking-[0.2em] text-xs uppercase animate-pulse`}>
          {mode === 'work' ? 'Focus Time' : 'Break Time'}
        </span>
      </div>

      {/* Main Timer Ring */}
      <div className="relative group cursor-pointer mb-8" onClick={toggleTimer}>

        {/* Ambient Glow */}
        <div className={`absolute inset-0 rounded-full blur-3xl ${glowColor} opacity-20 group-hover:opacity-40 transition-all duration-700`} />

        <svg className="transform -rotate-90 w-72 h-72 relative z-10 drop-shadow-2xl">
          {/* Track */}
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Ring */}
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * ((100 - progress) / 100)}
            className={`${ringColor} transition-all duration-1000 ease-in-out`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-7xl font-bold text-white tracking-tighter tabular-nums leading-none">
            {formatTime(secondsLeft)}
          </span>
          <div className="flex items-center gap-2 mt-4 opacity-50 text-xs uppercase tracking-widest text-white">
            {isActive ? (
              <span className="flex items-center gap-1 animate-pulse"><Pause className="w-3 h-3" /> Running</span>
            ) : (
              <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Paused</span>
            )}
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Subtle glass effect on hover within the ring */}
          <div className="absolute inset-4 rounded-full bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-40 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isActive ? <Pause className="w-16 h-16 text-white fill-white/20" /> : <Play className="w-16 h-16 text-white fill-white/20 ml-2" />}
          </div>
        </div>
      </div>

      {/* Controls / Toggles */}
      <div className="flex items-center gap-4">
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
          <button
            onClick={(e) => { e.stopPropagation(); setMode('work'); setIsActive(false); setSecondsLeft(workMinutes * 60); }}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'work' ? 'bg-red-500 shadow-lg shadow-red-900/20 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            Work
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMode('break'); setIsActive(false); setSecondsLeft(breakMinutes * 60); }}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'break' ? 'bg-emerald-500 shadow-lg shadow-emerald-900/20 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            Short Break
          </button>
        </div>

        <Button
          onClick={(e) => { e.stopPropagation(); resetTimer(); }}
          variant="ghost"
          className="w-10 h-10 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
