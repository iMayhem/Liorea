// src/app/jee-home/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, BrainCircuit, Music, Moon, Sun, Palette, MessageSquareWarning } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { CountdownTimer } from '@/components/countdown-timer';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getStudyLogsForUser } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { LiveStudyList } from '@/components/live-study-list';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ReportDialog } from '@/components/report-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChatIcon } from '@/components/icons';
import { PrivateChatOverlay } from '@/components/private-chat-overlay';


// Dynamically import the Calendar to ensure it only renders on the client
const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => <div className="h-[298px] w-full rounded-md bg-muted animate-pulse" />,
});

export default function JeeHomePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const { setTheme } = useTheme();
  const jee2026ExamDate = '2026-01-24T00:00:00'; // Tentative date for JEE Main 2026
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [studyLogs, setStudyLogs] = React.useState<Record<string, number>>({});
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);


  React.useEffect(() => {
    if (loading || !user) return;

    const fetchStudyLogs = async () => {
        const logs = await getStudyLogsForUser(user.uid);
        setStudyLogs(logs || {});
    };

    fetchStudyLogs();
  }, [user, loading, currentMonth]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      router.push(`/day/${dateString}`);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const maxStudyTime = Math.max(1, ...Object.values(studyLogs));

  return (
    <>
    <ReportDialog isOpen={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />
    <PrivateChatOverlay isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
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
            Select a date to track your JEE progress.
          </p>
        </div>
        
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-8">
            <LiveStudyList />
            <CountdownTimer targetDate={jee2026ExamDate} title="JEE 2026 Countdown"/>

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
                    modifiersStyles={{
                        studyDay: (day: Date) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const studyTime = studyLogs[dateKey] || 0;
                            const opacity = Math.max(0.1, Math.min(1, studyTime / maxStudyTime));
                            return { 
                                backgroundColor: `hsla(var(--primary-hsl), ${opacity})`,
                                color: 'hsl(var(--primary-foreground))'
                            };
                        }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
        </div>

        <div className="mt-8 flex gap-4">
            <Button asChild variant="secondary">
                <Link href="/jamnight">
                    <Music className="mr-2 h-4 w-4" />
                    Jamnight
                </Link>
            </Button>
        </div>
      </motion.main>
       <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-16 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsChatOpen(true)}
                >
                    <ChatIcon className="h-6 w-6" />
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
