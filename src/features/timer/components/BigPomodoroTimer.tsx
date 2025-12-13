"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
// import * as Tone from 'tone'; // Removed static import
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function BigPomodoroTimer() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [isActive, setIsActive] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);

    const synth = useRef<any>(null); // Use any to avoid type dependency

    useEffect(() => {
        if (typeof window !== 'undefined' && !synth.current) {
            import('tone').then((Tone) => {
                synth.current = new Tone.Synth().toDestination();
            });
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
                    synth.current?.triggerAttackRelease("C5", "8n");
                    const nextMode = mode === 'work' ? 'break' : 'work';
                    setMode(nextMode);
                    return (nextMode === 'work' ? workMinutes : breakMinutes) * 60;
                }
                return prevSeconds - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, mode, workMinutes, breakMinutes]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#1e1f22]/50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-8"
            >
                {/* Status Badge */}
                <div className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border transition-colors",
                    mode === 'work' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                )}>
                    {mode === 'work' ? 'Focus Time' : 'Break Time'}
                </div>

                {/* Big Time Display */}
                <div className="text-[120px] sm:text-[160px] font-bold leading-none tabular-nums tracking-tighter text-white drop-shadow-2xl">
                    {formatTime(secondsLeft)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <Button
                        onClick={toggleTimer}
                        className={cn(
                            "w-24 h-24 rounded-full transition-all shadow-xl hover:scale-105 active:scale-95",
                            isActive ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200"
                        )}
                    >
                        {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                    </Button>

                    <Button
                        onClick={resetTimer}
                        variant="outline"
                        className="w-16 h-16 rounded-full border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </Button>
                </div>

                {/* Modes */}
                <div className="flex gap-2 mt-8 p-1 bg-black/20 rounded-xl">
                    <button
                        onClick={() => { setMode('work'); setIsActive(false); }}
                        className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", mode === 'work' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
                    >
                        Pomodoro
                    </button>
                    <button
                        onClick={() => { setMode('break'); setIsActive(false); }}
                        className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", mode === 'break' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
                    >
                        Break
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
