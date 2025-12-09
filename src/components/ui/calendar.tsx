
"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      fixedWeeks
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "hidden",
        nav: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-white/40 rounded-md w-9 font-medium text-[0.8rem] uppercase tracking-wide",
        row: "w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0",
        day: cn(
          "h-9 w-9 p-0 font-normal text-white aria-selected:opacity-100 hover:bg-white/10 rounded-full transition-all duration-200 flex items-center justify-center"
        ),
        day_selected:
          "bg-white text-black hover:bg-white hover:text-black font-bold shadow-lg shadow-white/20",
        day_today: "bg-white/10 text-white font-semibold ring-1 ring-white/30",
        day_outside: "text-white/20 opacity-50",
        day_disabled: "text-white/10 opacity-30",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
