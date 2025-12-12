"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresence } from "@/features/study";
import { Clock, BookOpen, Flame } from "lucide-react";

type TickerEvent = {
    id: string;
    username: string;
    action: 'started_timer' | 'leveled_up' | 'on_fire';
    detail?: string;
};

export function LiveTicker() {
    const { studyUsers } = usePresence();
    const [events, setEvents] = useState<TickerEvent[]>([]);
    const [currentEvent, setCurrentEvent] = useState<TickerEvent | null>(null);

    // Mock Listener for demo - in real app, listen to a Firebase node or socket
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly generate an event for demonstration if users exist
            if (studyUsers.length > 0 && Math.random() > 0.7) {
                const randomUser = studyUsers[Math.floor(Math.random() * studyUsers.length)];
                const actions: TickerEvent['action'][] = ['started_timer', 'leveled_up', 'on_fire'];
                const action = actions[Math.floor(Math.random() * actions.length)];

                const newEvent: TickerEvent = {
                    id: Date.now().toString(),
                    username: randomUser.username,
                    action,
                    detail: action === 'started_timer' ? '25m Focus' : action === 'leveled_up' ? 'Level 5' : undefined
                };

                setEvents(prev => [...prev, newEvent]);
            }
        }, 8000); // Every 8 seconds try to add event
        return () => clearInterval(interval);
    }, [studyUsers]);

    // Process Queue
    useEffect(() => {
        if (!currentEvent && events.length > 0) {
            setCurrentEvent(events[0]);
            setEvents(prev => prev.slice(1));

            // Hide after 4s
            setTimeout(() => {
                setCurrentEvent(null);
            }, 4000);
        }
    }, [events, currentEvent]);

    if (!currentEvent) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEvent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#1e1f22]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm text-zinc-200"
                >
                    {currentEvent.action === 'started_timer' && <Clock className="w-4 h-4 text-blue-400" />}
                    {currentEvent.action === 'leveled_up' && <BookOpen className="w-4 h-4 text-yellow-400" />}
                    {currentEvent.action === 'on_fire' && <Flame className="w-4 h-4 text-orange-400" />}

                    <span className="font-bold text-white">{currentEvent.username}</span>
                    <span className="text-zinc-400">
                        {currentEvent.action === 'started_timer' && 'started a session'}
                        {currentEvent.action === 'leveled_up' && 'leveled up!'}
                        {currentEvent.action === 'on_fire' && 'is on a streak!'}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
