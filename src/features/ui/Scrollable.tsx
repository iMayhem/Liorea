"use client";

import { cn } from "@/lib/utils";
import { forwardRef, UIEvent } from "react";

interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  
  // Options
  hideScrollbar?: boolean;
  thin?: boolean;
  horizontal?: boolean;
  
  // Events
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
}

export const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  ({ className, children, hideScrollbar, thin, horizontal, onScroll, ...props }, ref) => {
    
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        className={cn(
          // Layout Constraints (Critical for Scroll)
          "relative w-full h-full overscroll-none",
          
          // Scroll Direction
          horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
          
          // Scrollbar Styling
          hideScrollbar ? "no-scrollbar" : "custom-scrollbar",
          (thin && !hideScrollbar) && "thin-scrollbar",

          // Custom classes (flex-1, etc)
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Scrollable.displayName = "Scrollable";