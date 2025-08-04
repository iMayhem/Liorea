// src/components/pomodoro-timer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RefreshCcw, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addStudySession } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(pomodoroTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const getDuration = useCallback((currentMode: TimerMode) => {
    switch (currentMode) {
      case 'pomodoro': return pomodoroTime * 60;
      case 'shortBreak': return shortBreakTime * 60;
      case 'longBreak': return longBreakTime * 60;
      default: return pomodoroTime * 60;
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime]);


  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTime(getDuration(newMode));
  }, [getDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
        if(mode === 'pomodoro' && user) {
            addStudySession(user.username, new Date())
                .then(() => {
                    toast({title: "Session logged!", description: "Great work. Your study session has been saved."});
                    setCompletedPomodoros(prev => prev + 1);
                })
                .catch(err => {
                    toast({title: "Error", description: "Could not save study session.", variant: "destructive"});
                });
            
            if ((completedPomodoros + 1) % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('pomodoro');
        }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, mode, user, toast, switchMode, completedPomodoros]);

  // Update timer if the duration for the current mode changes
  useEffect(() => {
    if (!isActive) {
        setTime(getDuration(mode));
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime, mode, isActive, getDuration]);


  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTime(getDuration(mode));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const percentage = (time / getDuration(mode)) * 100;

  return (
    <Card className="w-full max-w-md p-6 shadow-lg bg-card border-border/50">
       <CardHeader className="p-0 mb-6 flex flex-row justify-between items-center">
        <CardTitle>Pomodoro Timer</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
              <DialogDescription>
                Customize your Pomodoro session durations here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pomodoro" className="text-right">Pomodoro</Label>
                  <Input id="pomodoro" type="number" value={pomodoroTime} onChange={e => setPomodoroTime(Math.max(1, Number(e.target.value)))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shortBreak" className="text-right">Short Break</Label>
                  <Input id="shortBreak" type="number" value={shortBreakTime} onChange={e => setShortBreakTime(Math.max(1, Number(e.target.value)))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="longBreak" className="text-right">Long Break</Label>
                  <Input id="longBreak" type="number" value={longBreakTime} onChange={e => setLongBreakTime(Math.max(1, Number(e.target.value)))} className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
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
