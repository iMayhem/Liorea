
"use client";

import Header from '@/components/layout/Header';
import ClientOnly from './ClientOnly';
import PresencePanel from './study/PresencePanel';
import ExamCountdown from './timer/ExamCountdown';
import { usePresence } from '@/context/PresenceContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBackground } from '@/context/BackgroundContext';
import Leaderboard from './study/Leaderboard';
import StudyCalendar from './study/StudyCalendar';
import { Button } from './ui/button';
import { addMonths } from 'date-fns';

export default function LioreaClient() {
  const { error } = useBackground();
  const { onlineUsers } = usePresence();
  const nextYear = new Date().getFullYear() + 1;
  
  const jeeTargetDate = useMemo(() => new Date(`${nextYear}-01-24T09:00:00`), [nextYear]);
  const neetTargetDate = useMemo(() => new Date(`${nextYear}-05-05T14:00:00`), [nextYear]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCalendarMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => addMonths(prev, 1));
  };


  return (
    <>
      {error && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Background Error</AlertTitle>
                <AlertDescription>
                    Could not load backgrounds from the worker: {error}
                </AlertDescription>
            </Alert>
         </div>
      )}

      <Header />

      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="space-y-4">
            <PresencePanel users={onlineUsers} />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="bg-transparent text-white/70 hover:bg-white/10 hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                 <Button variant="outline" size="icon" onClick={handleNextMonth} className="bg-transparent text-white/70 hover:bg-white/10 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <div className="space-y-4">
            <ExamCountdown examName="JEE Main" targetDate={jeeTargetDate} />
            <ExamCountdown examName="NEET UG" targetDate={neetTargetDate} />
        </div>
      </div>

      <main className="relative z-1 min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-80">
            <StudyCalendar month={calendarMonth} onMonthChange={setCalendarMonth} />
          </div>
        </div>
      </main>
    </>
  );
}
