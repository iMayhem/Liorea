// src/components/shared-pomodoro-timer.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { TimerState } from '@/lib/types';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { logStudySession } from '@/lib/firestore';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface SharedPomodoroTimerProps {
  timerState: TimerState;
  onUpdate: (newState: Partial<TimerState>) => void;
  participants: {uid: string}[];
}

export function SharedPomodoroTimer({ timerState, onUpdate, participants }: SharedPomodoroTimerProps) {
  const { mode, isActive, time, startTime, studyDuration, shortBreakDuration, longBreakDuration } = timerState;
  const [displayTime, setDisplayTime] = React.useState(time);
  const { user } = useAuth();
  
  const getDuration = (mode: TimerState['mode']) => {
    switch(mode) {
        case 'study': return (studyDuration || 25) * 60;
        case 'shortBreak': return (shortBreakDuration || 5) * 60;
        case 'longBreak': return (longBreakDuration || 15) * 60;
        default: return 25 * 60;
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && startTime) {
       interval = setInterval(() => {
         const elapsed = Math.floor((Date.now() - (startTime as any).toMillis()) / 1000);
         const newTime = Math.max(0, getDuration(mode) - elapsed);
         setDisplayTime(newTime);
         if (newTime === 0) {
            handleTimerEnd();
         }
       }, 1000);
    } else {
        setDisplayTime(time);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime, time, mode, studyDuration, shortBreakDuration, longBreakDuration]);

  React.useEffect(() => {
    // When timer mode is changed from another client, we need to update the display time
    setDisplayTime(time);
  }, [time]);

  const handleTimerEnd = () => {
     // Only one client should handle the transition
    if (mode === 'study') {
       // Time logging is now handled by the useStudyRoom hook.
       switchMode('shortBreak');
    } else {
       switchMode('study');
    }
  };


  const toggleTimer = () => {
    onUpdate({ isActive: !isActive, startTime: serverTimestamp(), time: displayTime });
  };

  const resetTimer = () => {
     onUpdate({ isActive: false, time: getDuration(mode), startTime: null });
  };

  const switchMode = (newMode: 'study' | 'shortBreak' | 'longBreak') => {
    onUpdate({ mode: newMode, time: getDuration(newMode), isActive: false, startTime: null });
  };
  
  const handleDurationChange = (field: 'studyDuration' | 'shortBreakDuration' | 'longBreakDuration', value: string) => {
      const newDuration = Math.max(1, parseInt(value, 10)) || 0;
      const updatePayload: Partial<TimerState> = { [field]: newDuration };
      
      // If the currently active timer's mode is changed, reset it.
      if (
          (field === 'studyDuration' && mode === 'study') ||
          (field === 'shortBreakDuration' && mode === 'shortBreak') ||
          (field === 'longBreakDuration' && mode === 'longBreak')
      ) {
          updatePayload.time = newDuration * 60;
          updatePayload.isActive = false;
          updatePayload.startTime = null;
      }

      onUpdate(updatePayload);
  }


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    return getDuration(mode);
  };
  
  const percentage = (displayTime / getTotalTime()) * 100;
  const modeText = {
      study: "Time to Focus!",
      shortBreak: "Short Break",
      longBreak: "Long Break"
  }
  
  const modeIcon = {
      study: <Brain className="h-5 w-5 mr-2" />,
      shortBreak: <Coffee className="h-5 w-5 mr-2" />,
      longBreak: <Coffee className="h-5 w-5 mr-2" />
  }

  return (
    <Card className="w-full max-w-md shadow-lg bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-center items-center mb-4 gap-2">
            <div className="flex-grow flex justify-center gap-2">
                <Button variant={mode === 'study' ? 'secondary' : 'outline'} onClick={() => switchMode('study')}>Pomodoro</Button>
                <Button variant={mode === 'shortBreak' ? 'secondary' : 'outline'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
                <Button variant={mode === 'longBreak' ? 'secondary' : 'outline'} onClick={() => switchMode('longBreak')}>Long Break</Button>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Time settings</h4>
                        <p className="text-sm text-muted-foreground">
                        Set the time for your sessions (in minutes).
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="study">Pomodoro</Label>
                            <Input id="study" type="number" defaultValue={studyDuration || 25} onChange={(e) => handleDurationChange('studyDuration', e.target.value)} className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="short">Short Break</Label>
                            <Input id="short" type="number" defaultValue={shortBreakDuration || 5} onChange={(e) => handleDurationChange('shortBreakDuration', e.target.value)} className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="long">Long Break</Label>
                            <Input id="long" type="number" defaultValue={longBreakDuration || 15} onChange={(e) => handleDurationChange('longBreakDuration', e.target.value)} className="col-span-2 h-8" />
                        </div>
                    </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
        <CardTitle className="text-center text-2xl font-heading flex items-center justify-center">
            {modeIcon[mode]}
            {modeText[mode]}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 my-4">
           <CircularProgressbar
                value={percentage}
                text={formatTime(displayTime)}
                styles={buildStyles({
                    textColor: 'hsl(var(--foreground))',
                    pathColor: 'hsl(var(--primary))',
                    trailColor: 'hsl(var(--muted))',
                })}
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button onClick={toggleTimer} className="w-24">
          {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="outline" className="w-24">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
