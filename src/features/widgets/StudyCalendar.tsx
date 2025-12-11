"use client"

import * as React from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { usePresence } from "@/context/PresenceContext"
import { api } from "@/lib/api"
import { GlassCard } from "@/features/ui/GlassCard"

export default function StudyCalendar() {
  const { username } = usePresence();
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [studyLogs, setStudyLogs] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!username) return;

    // Use our centralized API
    api.study.getHistory(username)
      .then(setStudyLogs)
      .catch(() => {
         // Fallback for visual continuity
         const todayKey = format(new Date(), 'yyyy-MM-dd');
         setStudyLogs({ [todayKey]: 0 }); 
      });

  }, [username, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const isStudyDay = (day: Date) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return (studyLogs[dateKey] || 0) > 0;
  };

  return (
    <GlassCard variant="ghost" className="w-full max-w-xs mx-auto border-none bg-black/10">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-2 pb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-bold text-white tracking-wide uppercase">
            {format(currentMonth, "MMMM yyyy")}
        </span>

        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex justify-center">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-0"
            classNames={{
              caption: "hidden",       // We built our own header
              nav: "hidden",           // We built our own nav
              table: "w-full border-collapse space-y-1",
              head_row: "flex mb-2",
              head_cell: "text-white/30 w-8 font-normal text-[0.65rem] uppercase tracking-wider",
              row: "flex w-full mt-2",
              cell: "h-8 w-8 text-center text-sm p-0 relative",
              
              // Standard Day
              day: "h-8 w-8 p-0 font-normal text-white hover:bg-white/10 rounded-full transition-all",
              
              // Selected Day
              day_selected: "bg-white text-black hover:bg-white hover:text-black font-bold shadow-lg",
              
              // Today
              day_today: "ring-1 ring-white/30 text-white font-semibold",
              
              // Outside Month
              day_outside: "text-white/10 opacity-50",
            }}
            modifiers={{ studyDay: isStudyDay }}
            modifiersClassNames={{ 
              studyDay: "bg-green-500/20 text-green-200 font-bold border border-green-500/30" 
            }}
        />
      </div>
    </GlassCard>
  )
}