// src/app/history/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, History } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserProgress, TimeTableData } from '@/lib/types';
import { getAllProgressForUser } from '@/lib/firestore';
import { TimeTableView } from '@/components/timetable-view';
import { generateTimeTableForDate } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function getTimetableForDate(date: string): TimeTableData {
    return generateTimeTableForDate(date);
}

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [progress, setProgress] = React.useState<UserProgress | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    React.useEffect(() => {
        if (user) {
            setLoading(true);
            getAllProgressForUser(user.username)
                .then(data => {
                    setProgress(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch progress history:", err);
                    setLoading(false);
                });
        }
    }, [user]);

    if (authLoading || loading || !user) {
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <AppHeader />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }
    
    const sortedDates = progress ? Object.keys(progress).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) : [];


    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <AppHeader />
            <motion.main
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="flex-1 container mx-auto p-4 md:p-6 lg:p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-heading flex items-center justify-center">
                        <History className="mr-4 h-10 w-10" />
                        Your Progress History
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        A complete record of your daily tasks and achievements.
                    </p>
                </div>

                {sortedDates.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Records</CardTitle>
                            <CardDescription>Click on a date to view the details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {sortedDates.map(date => (
                                    <AccordionItem value={date} key={date}>
                                        <AccordionTrigger className="text-lg font-medium">{date}</AccordionTrigger>
                                        <AccordionContent>
                                            <TimeTableView
                                                day={date}
                                                subjects={getTimetableForDate(date)[date] || []}
                                                progress={progress!}
                                                onTaskToggle={() => {}}
                                                onScoreSave={() => {}}
                                                isReadOnly={true}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center mt-16">
                        <p className="text-muted-foreground text-lg">No history found yet.</p>
                        <p className="text-muted-foreground">Complete some daily tasks to see your progress here.</p>
                    </div>
                )}
            </motion.main>
        </div>
    );
}
