"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GlobalTimer() {
    // Mock global study time for now
    const [totalHours, setTotalHours] = useState(1240);

    useEffect(() => {
        // Increment subtly to show "live" activity
        const interval = setInterval(() => {
            setTotalHours(prev => prev + (Math.random() > 0.5 ? 1 : 0));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Global Focus Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono">
                    {totalHours.toLocaleString()}h
                </div>
            </CardContent>
        </Card>
    );
}