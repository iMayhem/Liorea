"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalTimer } from '@/context/GlobalTimerContext';
import { Maximize, Clock } from 'lucide-react';

export default function PomodoroTimer() {
  const { elapsedTime } = useGlobalTimer();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);


  const totalDuration = 50 * 60; // 50 minutes in seconds
  const timeRemaining = totalDuration - (elapsedTime % totalDuration);
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  const radius = isFullscreen ? 200 : 150;
  const stroke = isFullscreen ? 14 : 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const toggleFullscreen = () => {
    if (!cardRef.current) return;

    if (!document.fullscreenElement) {
        cardRef.current.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };
  
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Card 
        ref={cardRef}
        className="bg-black/10 backdrop-blur-md border border-white/30 text-white w-full max-w-md mx-auto transition-all duration-300"
    >
      <CardContent className="relative flex flex-col items-center gap-4 pt-6 text-center">
         <button onClick={toggleFullscreen} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <Maximize className="w-5 h-5" />
         </button>

         <div className="text-center">
            <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Global Session</h2>
            <p className="text-xs text-white/60">Syncs automatically every 50 mins</p>
        </div>

        <div className="relative flex flex-col items-center justify-center" style={{ width: radius*2, height: radius * 2}}>
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-white/10"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className="text-primary transition-all duration-300"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <div className={`font-mono font-bold text-white tracking-tighter ${isFullscreen ? 'text-8xl' : 'text-7xl'}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 text-sm uppercase text-white/60 tracking-widest">
            <Clock className="w-4 h-4"/>
            <span>Time Remaining</span>
        </div>
      </CardContent>
    </Card>
  );
}
