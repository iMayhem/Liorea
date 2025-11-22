'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, MessageSquareWarning, Trophy, Settings, Edit, Check, CheckCircle, XCircle } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getStudyLogsForUser, getUserTimetable, checkUsernameUnique, updateUserProfile } from '@/lib/db';
import { UserActivityList } from '@/components/user-activity-list';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { useStudyRoom } from '@/hooks/use-study-room';
import type { CustomTimetable } from '@/lib/types';
import { CountdownTimer } from '@/components/countdown-timer';
import { Skeleton } from '@/components/ui/skeleton';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';

const Calendar = dynamic(() => import('@/components/ui/calendar').then(mod => mod.Calendar), { ssr: false, loading: () => <Skeleton className="h-[298px] w-full rounded-md" /> });
const ReportDialog = dynamic(() => import('@/components/report-dialog').then(mod => mod.ReportDialog), { ssr: false });
const TimetableSettingsOverlay = dynamic(() => import('@/components/timetable-settings-overlay').then(mod => mod.TimetableSettingsOverlay), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading, loadingProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const { setIsLeaderboardOpen } = useStudyRoom();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [studyLogs, setStudyLogs] = React.useState<Record<string, number>>({});
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [userTimetable, setUserTimetable] = React.useState<CustomTimetable | null>(null);

  const [isEditingUsername, setIsEditingUsername] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [usernameStatus, setUsernameStatus] = React.useState<UsernameStatus>('idle');
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);
  const [feeling, setFeeling] = React.useState('');

  // --- URL CLEANER ---
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code')) {
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  // --- AUTH & REDIRECT LOGIC ---
  React.useEffect(() => {
    if (loading) return; 
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!loadingProfile && profile && !profile.username) {
      router.push('/set-username');
      return;
    }

    if (profile && !newUsername) {
        setNewUsername(profile.username || '');
        setFeeling(profile.feeling || '');
    }
  }, [user, profile, loading, loadingProfile, router, newUsername]);

  // --- DATA FETCHING ---
  React.useEffect(() => {
    if (loading || !user) return;
    const fetchData = async () => {
        try {
            const logs = await getStudyLogsForUser(user.uid);
            setStudyLogs(logs || {});
            const timetable = await getUserTimetable(user.uid);
            setUserTimetable(timetable);
        } catch(e) { console.error(e); }
    };
    fetchData();
  }, [user, loading, currentMonth]);

  const checkUsername = useDebouncedCallback(async (name: string) => {
      if (name.length < 3) { setUsernameStatus('invalid'); return; }
      if (name === profile?.username) { setUsernameStatus('idle'); return; }
      setUsernameStatus('checking');
      const isUnique = await checkUsernameUnique(name);
      setUsernameStatus(isUnique ? 'available' : 'unavailable');
  }, 500);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setNewUsername(value);
      checkUsername(value);
  };
  
  const handleSaveUsername = async () => {
    if ((usernameStatus !== 'available' && newUsername !== profile?.username) || isSavingUsername || !user) return;
    setIsSavingUsername(true);
    try {
        await updateUserProfile(user.uid, { username: newUsername });
        await refreshProfile();
        toast({ title: "Success!", description: "Username updated." });
        setIsEditingUsername(false);
    } catch (error) {
        toast({ title: "Error", description: "Could not update username.", variant: "destructive" });
    } finally {
        setIsSavingUsername(false);
    }
  };

  const handleFeelingChange = (e: React.ChangeEvent<HTMLInputElement>) => setFeeling(e.target.value);
  const handleFeelingBlur = async () => {
      if (!user || feeling === profile?.feeling) return;
      await updateUserProfile(user.uid, { feeling: feeling });
      await refreshProfile();
      toast({ title: "Status updated!" });
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      router.push(`/day/${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };
  
  const getStatusIndicator = () => {
      switch (usernameStatus) {
          case 'checking': return <Loader2 className="h-4 w-4 animate-spin" />;
          case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />;
          case 'unavailable': return <XCircle className="h-4 w-4 text-destructive" />;
          default: return null;
      }
  };

  if (loading || !user || !profile?.username) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <React.Fragment>
    {isReportDialogOpen && <ReportDialog isOpen={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />}
    {isSettingsOpen && <TimetableSettingsOverlay isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} currentTimetable={userTimetable} onTimetableSave={setUserTimetable}/>}
    
    <div className="flex flex-col min-h-screen text-foreground">
      <AppHeader />
       <div className="flex-1 grid lg:grid-cols-[320px_1fr_320px] lg:gap-4">
            <div className="hidden lg:block sticky top-14 h-[calc(100vh-theme(height.14))] p-4 pl-4 pr-0">
                <UserActivityList />
            </div>

            <motion.main
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.5}}
                className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 text-center"
            >
                <div className="lg:hidden w-full max-w-md mx-auto mb-8 h-64">
                    <UserActivityList />
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="text-center mb-4 space-y-2">
                         <div className="flex items-center justify-center gap-2 h-10">
                            {isEditingUsername ? (
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={newUsername}
                                        onChange={handleUsernameChange}
                                        className="text-4xl font-bold font-heading h-12 pr-8 text-center"
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                      {getStatusIndicator()}
                                    </div>
                                </div>
                            ) : (
                                <h1 className="text-4xl font-bold font-heading">Welcome, {profile.username}!</h1>
                            )}
                             <Button variant="ghost" size="icon" onClick={() => {
                                if (isEditingUsername) {
                                    handleSaveUsername();
                                } else {
                                    setIsEditingUsername(true);
                                    setNewUsername(profile.username || '');
                                    setUsernameStatus('idle');
                                }
                             }}>
                                {isEditingUsername ? 
                                    isSavingUsername ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" /> 
                                    : <Edit className="h-6 w-6" />
                                }
                            </Button>
                        </div>
                        <div className="h-6">
                             <Input
                                type="text"
                                placeholder="How are you feeling today?"
                                value={feeling}
                                onChange={handleFeelingChange}
                                onBlur={handleFeelingBlur}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className="text-center text-muted-foreground italic bg-background/20 backdrop-blur-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md"
                            />
                        </div>
                    </div>
                    
                    <div className="relative w-full max-w-md mx-auto">
                        <Card className="w-full shadow-lg rounded-lg border-border/50 card">
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
                                        return (studyLogs[dateKey] || 0) > 0;
                                    }
                                }}
                                modifiersClassNames={{ studyDay: 'study-day-modifier' }}
                            />
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-4">
                         <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </motion.main>
            
             <div className="hidden lg:flex flex-col items-center justify-center p-4 pr-4 pl-0">
                <div className="w-full max-w-xs mx-auto flex flex-col gap-8">
                    <CountdownTimer targetDate="2026-01-01T00:00:00" title="JEE Mains 2026"/>
                    <CountdownTimer targetDate="2026-05-03T00:00:00" title="NEET 2026 Countdown"/>
                </div>
            </div>

      </div>
       <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-28 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsLeaderboardOpen(true)}
                >
                    <Trophy className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Leaderboard</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="fixed bottom-12 right-4 h-12 w-12 rounded-full shadow-lg bg-background/30 backdrop-blur-sm"
                    onClick={() => setIsReportDialogOpen(true)}
                >
                    <MessageSquareWarning className="h-6 w-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Report an Issue</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    </React.Fragment>
  );
}