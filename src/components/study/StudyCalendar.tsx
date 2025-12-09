"use client"

import * as React from "react"
import { format, addMonths, subMonths, isSameDay, parseISO } from "date-fns"
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

  // Simulate fetching study logs or fetch from worker if available
  React.useEffect(() => {
    if (!username) return;

    const fetchLogs = async () => {
        try {
            // Ideally, we fetch from the worker. 
            // Since we are adapting this, we check if the endpoint exists or fail gracefully
            const res = await fetch(`${WORKER_URL}/study/history?username=${username}`);
            if (res.ok) {
                const data = await res.json();
                setStudyLogs(data);
            } else {
                // Fallback for visual demo if backend isn't ready:
                // Mark today as studied
                const todayKey = format(new Date(), 'yyyy-MM-dd');
                setStudyLogs({ [todayKey]: 60 }); 
            }
        } catch (e) {
            console.error("Failed to fetch study logs", e);
             // Fallback visual
             const todayKey = format(new Date(), 'yyyy-MM-dd');
             setStudyLogs({ [todayKey]: 60 }); 
        }
    };

    fetchLogs();
  }, [username, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  // This function checks if a day has study activity
  const isStudyDay = (day: Date) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return (studyLogs[dateKey] || 0) > 0;
  };

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white w-full max-w-sm mx-auto shadow-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-white/10 text-white">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1 text-[10px] text-white/60 uppercase tracking-widest">
                <Activity className="w-3 h-3" /> Study Tracker
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-white/10 text-white">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex justify-center">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-3"
            modifiers={{
                studyDay: (day) => isStudyDay(day),
            }}
            modifiersClassNames={{
                studyDay: 'study-day-modifier'
            }}
            classNames={{
                caption: "hidden", // Hide default caption
                nav: "hidden", // Hide default nav buttons
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-white/50 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-md transition-colors text-white",
                day_selected: "bg-white text-black hover:bg-white hover:text-black font-bold",
                day_today: "bg-white/20 text-white font-semibold",
                day_outside: "text-white/20 opacity-50",
                day_disabled: "text-white/20 opacity-50",
                day_hidden: "invisible",
            }}
        />
      </CardContent>
    </Card>
  )
}