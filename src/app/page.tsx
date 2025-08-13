// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Music, MessageSquareWarning, Trophy, Settings } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getStudyLogsForUser, getUserTimetable } from '@/lib/firestore';
import { LiveStudyList } from '@/components/live-study-list';
import { ReportDialog } from '@/components/report-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChatIcon } from '@/components/icons';
import { useStudyRoom } from '@/hooks/use-study-room';
import { TimetableSettingsOverlay } from '@/components/timetable-settings-overlay';
import type { CustomTimetable } from '@/lib/types';
import { CountdownTimer } from '@/components/countdown-timer';


// Dynamically import the Calendar to ensure it only renders on the client
const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => <div className="h-[298px] w-full rounded-md bg-muted animate-pulse" />,
});

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const { setIsPrivateChatOpen, setIsLeaderboardOpen, hasNewPrivateMessage } = useStudyRoom();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [studyLogs, setStudyLogs] = React.useState<Record<string, number>>({});
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [userTimetable, setUserTimetable] = React.useState<CustomTimetable | null>(null);


  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else if (!profile?.username) {
      router.push('/set-username');
    }
  }, [user, profile, loading, router]);

  React.useEffect(() => {
    if (loading || !user) return;

    const fetchStudyLogs = async () => {
        const logs = await getStudyLogsForUser(user.uid);
        setStudyLogs(logs || {});
    };

    const fetchTimetable = async () => {
        const timetable = await getUserTimetable(user.uid);
        setUserTimetable(timetable);
    }

    fetchStudyLogs();
    fetchTimetable();
  }, [user, loading, currentMonth]);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };
  
  const studyDayStyle = React.useMemo(() => {
    if (Object.keys(studyLogs).length === 0) return {};
    const maxStudyTime = Math.max(1, ...Object.values(studyLogs));
    return (day: Date) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const studyTime = studyLogs[dateKey] || 0;
        if (studyTime === 0) return {};
        
        const opacity = Math.max(0.1, Math.min(1, studyTime / maxStudyTime));
        return { 
            backgroundColor: `hsla(var(--primary-hsl), ${opacity})`,
            color: 'hsl(var(--primary-foreground))'
        };
    }
  }, [studyLogs]);


  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <>
    <ReportDialog isOpen={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />
    <TimetableSettingsOverlay isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} currentTimetable={userTimetable} onTimetableSave={setUserTimetable}/>
    <div className="flex flex-col min-h-screen text-foreground">
      <AppHeader />
      <motion.main
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5}}
        className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-heading">Welcome, {profile.username}!</h1>
          <p className="text-muted-foreground mt-2">
            Select a date to track your progress.
          </p>
        </div>
        
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-8">
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 items-start justify-center gap-8">
                
                {/* Left Column */}
                <div className="w-full max-w-xs mx-auto flex flex-col gap-8">
                    <LiveStudyList />
                    <CountdownTimer targetDate="2026-05-03T00:00:00" title="NEET 2026 Countdown"/>
                </div>

                {/* Center Column */}
                 <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-md mx-auto">
                        <Card className="w-full shadow-lg rounded-lg border-border/50 bg-card">
                            <CardContent className="flex justify-center p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="rounded-md"
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                modifiers={{
                                studyDay: (day) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    return studyLogs[dateKey] > 0;
                                }
                                }}
                                modifiersClassNames={{
                                    studyDay: 'study-day-modifier'
                                }}
                                modifiersStyles={{ studyDay: studyDayStyle }}
                            />
                            </CardContent>
                        </Card>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute top-2 right-2 h-10 w-10 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button asChild variant="secondary">
                        <Link href="/jamnight">
                            <Music className="mr-2 h-4 w-4" />
                            Jamnight
                        </Link>
                    </Button>
                </div>
                
                {/* Right Column */}
                <div className="w-full max-w-xs mx-auto flex flex-col gap-8">
                     <CountdownTimer targetDate="2026-01-01T00:00:00" title="JEE Mains 2026"/>
                </div>

            </div>
        </div>

      </motion.main>
       <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-32 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsLeaderboardOpen(true)}
                >
                    <Trophy className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Leaderboard</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-16 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsPrivateChatOpen(true)}
                >
                    <ChatIcon showDot={hasNewPrivateMessage} className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Private Chat</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsReportDialogOpen(true)}
                >
                    <MessageSquareWarning className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Report an Issue</p>
            </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    </>
  );
}
