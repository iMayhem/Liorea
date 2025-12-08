"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalTimer } from '@/context/GlobalTimerContext';

export default function PomodoroTimer() {
  const { elapsedTime } = useGlobalTimer();

  const totalDuration = 50 * 60; // 50 minutes in seconds
  const timeRemaining = totalDuration - (elapsedTime % totalDuration);
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  const radius = 80;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/20 text-white w-full max-w-sm mx-auto">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <div className="relative flex flex-col items-center justify-center w-44 h-44">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-muted/20"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className="text-accent transition-all duration-300"
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
                <div className="text-sm font-medium uppercase tracking-widest">Focus Session</div>
                <div className="text-4xl font-mono font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
