// src/components/shared-pomodoro-timer.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { TimerState } from '@/lib/types';
import { serverTimestamp } from 'firebase/firestore';


const STUDY_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

interface SharedPomodoroTimerProps {
  timerState: TimerState;
  onUpdate: (newState: Partial<TimerState>) => void;
}

export function SharedPomodoroTimer({ timerState, onUpdate }: SharedPomodoroTimerProps) {
  const { mode, isActive, time, startTime } = timerState;
  const [displayTime, setDisplayTime] = React.useState(time);
  
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && startTime) {
       interval = setInterval(() => {
         const elapsed = Math.floor((Date.now() - (startTime as any).toMillis()) / 1000);
         const newTime = Math.max(0, time - elapsed);
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
  }, [isActive, startTime, time]);

  const handleTimerEnd = () => {
     // Only one client should handle the transition
     // A more robust solution might involve a server-side function
     // For now, any client can trigger the next state
    if (mode === 'study') {
       switchMode('shortBreak');
    } else {
       switchMode('study');
    }
  };


  const toggleTimer = () => {
    onUpdate({ isActive: !isActive, startTime: serverTimestamp() });
  };

  const resetTimer = () => {
    let newTime;
    switch (mode) {
      case 'study':
        newTime = STUDY_TIME;
        break;
      case 'shortBreak':
        newTime = SHORT_BREAK_TIME;
        break;
      case 'longBreak':
        newTime = LONG_BREAK_TIME;
        break;
    }
     onUpdate({ isActive: false, time: newTime, startTime: null });
  };

  const switchMode = (newMode: 'study' | 'shortBreak' | 'longBreak') => {
    let newTime;
    switch (newMode) {
      case 'study':
        newTime = STUDY_TIME;
        break;
      case 'shortBreak':
        newTime = SHORT_BREAK_TIME;
        break;
      case 'longBreak':
        newTime = LONG_BREAK_TIME;
        break;
    }
    onUpdate({ mode: newMode, time: newTime, isActive: false, startTime: null });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    switch (mode) {
      case 'study':
        return STUDY_TIME;
      case 'shortBreak':
        return SHORT_BREAK_TIME;
      case 'longBreak':
        return LONG_BREAK_TIME;
    }
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
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <div className="flex justify-center mb-4 gap-2">
            <Button variant={mode === 'study' ? 'secondary' : 'outline'} onClick={() => switchMode('study')}>Pomodoro</Button>
            <Button variant={mode === 'shortBreak' ? 'secondary' : 'outline'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
            <Button variant={mode === 'longBreak' ? 'secondary' : 'outline'} onClick={() => switchMode('longBreak')}>Long Break</Button>
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
