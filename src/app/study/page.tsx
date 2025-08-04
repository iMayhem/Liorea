// src/app/study/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PomodoroTimer } from '@/components/pomodoro-timer';

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
                className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 text-center"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-heading">Study Space</h1>
                    <p className="text-muted-foreground mt-2">
                        Use the Pomodoro timer to focus and track your study sessions.
                    </p>
                </div>
                
                <PomodoroTimer />

            </motion.main>
             <footer className="mt-auto p-4 text-center text-sm text-muted-foreground">
                <p>Finish a session, take a break. You've got this!</p>
            </footer>
        </div>
    );
}
