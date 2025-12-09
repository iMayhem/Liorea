"use client"

import * as React from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { usePresence } from "@/context/PresenceContext"

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export default function StudyCalendar() {
  const { username } = usePresence();
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [studyLogs, setStudyLogs] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!username) return;

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${WORKER_URL}/study/history?username=${username}`);
            if (res.ok) {
                const data = await res.json();
                setStudyLogs(data);
            } else {
                // Fallback for visual demo
                const todayKey = format(new Date(), 'yyyy-MM-dd');
                setStudyLogs({ [todayKey]: 60 }); 
            }
        } catch (e) {
             const todayKey = format(new Date(), 'yyyy-MM-dd');
             setStudyLogs({ [todayKey]: 60 }); 
        }
    };

    fetchLogs();
  }, [username, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const isStudyDay = (day: Date) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return (studyLogs[dateKey] || 0) > 0;
  };

  return (
    // Key change: glass-panel-2 styling and border adjustments to look "smooth"
    <Card className="w-full max-w-xs mx-auto border-none shadow-none bg-black/5 backdrop-blur-sm text-white">
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth} 
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center justify-center">
            <h2 className="font-bold text-lg tracking-tight text-white">
                {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/50 uppercase tracking-widest mt-0.5">
                <Activity className="w-3 h-3" /> 
                Study Tracker
            </div>
        </div>

        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth} 
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 flex justify-center">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-0"
            modifiers={{ studyDay: (day) => isStudyDay(day) }}
            modifiersClassNames={{ studyDay: 'study-day-modifier' }}
        />
      </CardContent>
    </Card>
  )
}