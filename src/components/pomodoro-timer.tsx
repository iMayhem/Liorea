// src/components/pomodoro-timer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addStudySession } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const POMODORO_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const LONG_BREAK_TIME = 15 * 60; // 15 minutes

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'pomodoro':
        setTime(POMODORO_TIME);
        break;
      case 'shortBreak':
        setTime(SHORT_BREAK_TIME);
        break;
      case 'longBreak':
        setTime(LONG_BREAK_TIME);
        break;
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
        // When timer finishes
        if(mode === 'pomodoro' && user) {
            addStudySession(user.username, new Date())
                .then(() => {
                    toast({title: "Session logged!", description: "Great work. Your study session has been saved."});
                    setCompletedPomodoros(prev => prev + 1);
                })
                .catch(err => {
                    toast({title: "Error", description: "Could not save study session.", variant: "destructive"});
                });
            
             // Automatically switch to break
            if ((completedPomodoros + 1) % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            // Switch back to pomodoro after a break
            switchMode('pomodoro');
        }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, mode, user, toast, switchMode, completedPomodoros]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'pomodoro':
        setTime(POMODORO_TIME);
        break;
      case 'shortBreak':
        setTime(SHORT_BREAK_TIME);
        break;
      case 'longBreak':
        setTime(LONG_BREAK_TIME);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    switch(mode){
        case 'pomodoro': return POMODORO_TIME;
        case 'shortBreak': return SHORT_BREAK_TIME;
        case 'longBreak': return LONG_BREAK_TIME;
    }
  }

  const percentage = (time / getTotalTime()) * 100;

  return (
    <Card className="w-full max-w-md p-6 shadow-lg bg-card border-border/50">
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="w-64 h-64 mb-6">
            <CircularProgressbar
                value={percentage}
                text={formatTime(time)}
                styles={buildStyles({
                    textColor: 'hsl(var(--foreground))',
                    pathColor: 'hsl(var(--primary))',
                    trailColor: 'hsl(var(--muted))',
                    textSize: '18px',
                })}
            />
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant={mode === 'pomodoro' ? 'default' : 'secondary'} onClick={() => switchMode('pomodoro')}>Pomodoro</Button>
          <Button variant={mode === 'shortBreak' ? 'default' : 'secondary'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
          <Button variant={mode === 'longBreak' ? 'default' : 'secondary'} onClick={() => switchMode('longBreak')}>Long Break</Button>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-32">
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RefreshCcw className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
