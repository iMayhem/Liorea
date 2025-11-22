// src/components/pomodoro-timer.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


const defaultStudyTime = 25;
const defaultShortBreakTime = 5;
const defaultLongBreakTime = 15;

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const [studyDuration, setStudyDuration] = React.useState(defaultStudyTime);
  const [shortBreakDuration, setShortBreakDuration] = React.useState(defaultShortBreakTime);
  const [longBreakDuration, setLongBreakDuration] = React.useState(defaultLongBreakTime);

  const [mode, setMode] = React.useState<TimerMode>('study');
  
  const getInitialTime = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'study': return studyDuration * 60;
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
      default: return studyDuration * 60;
    }
  };

  const [time, setTime] = React.useState(getInitialTime(mode));
  const [isActive, setIsActive] = React.useState(false);
  const [studySessions, setStudySessions] = React.useState(0);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
        if (audioRef.current) {
            audioRef.current.play();
        }
        handleTimerEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, time]);
  
  React.useEffect(() => {
    resetTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyDuration, shortBreakDuration, longBreakDuration]);


  const handleTimerEnd = () => {
    setIsActive(false);
    if (mode === 'study') {
      const newSessionCount = studySessions + 1;
      setStudySessions(newSessionCount);
      if (newSessionCount % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('study');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(getInitialTime(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTime(getInitialTime(newMode));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    return getInitialTime(mode);
  };
  
  const percentage = (time / getTotalTime()) * 100;
  const modeText = {
      study: "Time to Focus!",
      shortBreak: "Time for a Short Break!",
      longBreak: "Time for a Long Break!"
  }
  
  const modeIcon = {
      study: <Brain className="h-5 w-5 mr-2" />,
      shortBreak: <Coffee className="h-5 w-5 mr-2" />,
      longBreak: <Coffee className="h-5 w-5 mr-2" />
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <div className="flex justify-center items-center mb-4 gap-2">
            <div className="flex-grow flex justify-center gap-2">
                <Button variant={mode === 'study' ? 'default' : 'outline'} onClick={() => switchMode('study')}>
                    Pomodoro
                </Button>
                <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => switchMode('shortBreak')}>
                    Short Break
                </Button>
                <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => switchMode('longBreak')}>
                    Long Break
                </Button>
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
                            <Input id="study" type="number" value={studyDuration} onChange={(e) => setStudyDuration(Math.max(1, parseInt(e.target.value, 10)))} className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="short">Short Break</Label>
                            <Input id="short" type="number" value={shortBreakDuration} onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value, 10)))} className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="long">Long Break</Label>
                            <Input id="long" type="number" value={longBreakDuration} onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value, 10)))} className="col-span-2 h-8" />
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
        <CardDescription className="text-center">
            Completed Sessions: {studySessions}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 my-4">
           <CircularProgressbar
                value={percentage}
                text={formatTime(time)}
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
       <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>
    </Card>
  );
}
