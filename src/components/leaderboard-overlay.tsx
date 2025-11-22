'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboardData } from '@/lib/db'; // Updated import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaderboard } from '@/components/leaderboard';
import { useStudyRoom } from '@/hooks/use-study-room';

export function LeaderboardOverlay() {
    const { isLeaderboardOpen, setIsLeaderboardOpen } = useStudyRoom(); // Controlled by study room context now
    const { user } = useAuth();
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isLeaderboardOpen) {
            setLoading(true);
            getLeaderboardData('daily').then(d => {
                setData(d);
                setLoading(false);
            });
        }
    }, [isLeaderboardOpen]);

    if (!isLeaderboardOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={() => setIsLeaderboardOpen(false)}>
                    <X className="h-8 w-8" />
                </Button>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-4xl h-[80vh]">
                    <Card className="h-full bg-background/90">
                        <CardHeader><CardTitle>Leaderboard (Total Hours)</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Loader2 className="mx-auto animate-spin"/> : <Leaderboard users={data} currentUser={user as any} viewType="all-time"/>}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}