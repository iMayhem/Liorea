'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Maximize, Minimize } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { TimerState } from '@/lib/types';

interface SharedPomodoroTimerProps {
  timerState: TimerState;
}

export function SharedPomodoroTimer({ timerState }: SharedPomodoroTimerProps) {
  const { time, totalDuration } = timerState;
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const timerRef = React.useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (time / totalDuration) * 100;

  const toggleFullscreen = () => {
      if (!timerRef.current) return;
      if (!document.fullscreenElement) {
          timerRef.current.requestFullscreen().catch(console.error);
      } else {
          document.exitFullscreen();
      }
  };

  React.useEffect(() => {
      const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={timerRef} className={cn("w-full flex items-center justify-center transition-all", isFullscreen ? 'bg-background p-8 flex-col' : '')}>
        <Card className={cn("w-full shadow-xl bg-background/80 backdrop-blur-lg transition-all border-border/50", isFullscreen ? 'max-w-2xl' : 'max-w-md')}>
          <CardHeader className="pb-2 relative">
             <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-primary uppercase tracking-widest">
                    Global Session
                </h2>
                <p className="text-xs text-muted-foreground">Syncs automatically every 50 mins</p>
             </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className={cn("transition-all duration-300 relative flex items-center justify-center", isFullscreen ? "w-96 h-96" : "w-64 h-64")}>
               <CircularProgressbar
                    value={percentage}
                    text={formatTime(time)}
                    strokeWidth={4}
                    styles={buildStyles({
                        textColor: 'hsl(var(--foreground))',
                        pathColor: 'hsl(var(--primary))',
                        trailColor: 'hsl(var(--muted))',
                        textSize: '24px',
                        pathTransitionDuration: 0.5,
                    })}
                />
                <div className="absolute bottom-14 text-muted-foreground font-medium text-xs tracking-widest uppercase flex items-center gap-2">
                    <Clock className="h-3 w-3"/> Time Remaining
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}