// src/components/pomodoro-timer.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const STUDY_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes
const LONG_BREAK_TIME = 15 * 60; // 15 minutes

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const [mode, setMode] = React.useState<TimerMode>('study');
  const [time, setTime] = React.useState(STUDY_TIME);
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
  }, [isActive, time]);

  const handleTimerEnd = () => {
    setIsActive(false);
    if (mode === 'study') {
      const newSessionCount = studySessions + 1;
      setStudySessions(newSessionCount);
      if (newSessionCount % 4 === 0) {
        setMode('longBreak');
        setTime(LONG_BREAK_TIME);
      } else {
        setMode('shortBreak');
        setTime(SHORT_BREAK_TIME);
      }
    } else {
      setMode('study');
      setTime(STUDY_TIME);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'study':
        setTime(STUDY_TIME);
        break;
      case 'shortBreak':
        setTime(SHORT_BREAK_TIME);
        break;
      case 'longBreak':
        setTime(LONG_BREAK_TIME);
        break;
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    switch (newMode) {
      case 'study':
        setTime(STUDY_TIME);
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
    switch (mode) {
      case 'study':
        return STUDY_TIME;
      case 'shortBreak':
        return SHORT_BREAK_TIME;
      case 'longBreak':
        return LONG_BREAK_TIME;
    }
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
        <div className="flex justify-center mb-4 gap-2">
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
