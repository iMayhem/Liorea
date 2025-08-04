// src/app/study/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { TodoList } from '@/components/todo-list';

export default function StudyPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <AppHeader />
            <motion.main
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="flex-1 container mx-auto flex flex-col items-center justify-center p-4"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-heading">Study Space</h1>
                    <p className="text-muted-foreground mt-2">
                        Use the Pomodoro timer and to-do list to focus your session.
                    </p>
                </div>
                
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-8">
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <PomodoroTimer />
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <TodoList />
                    </div>
                </div>

            </motion.main>
             <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
                <p>Finish a session, take a break. You've got this!</p>
            </footer>
        </div>
    );
}
