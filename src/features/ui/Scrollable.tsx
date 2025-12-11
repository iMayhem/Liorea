"use client";

import { cn } from "@/lib/utils";
import { forwardRef, UIEvent } from "react";

interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  
  // Options
  hideScrollbar?: boolean; // True = invisible scrollbar
  thin?: boolean;          // True = 3px wide (good for small lists)
  horizontal?: boolean;    // Allow horizontal scrolling
  
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
          // 1. Base Structure
          "relative",
          horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
          
          // 2. Scrollbar Styling Logic
          hideScrollbar ? "no-scrollbar" : "custom-scrollbar",
          (thin && !hideScrollbar) && "thin-scrollbar",

          // 3. Custom classes passed from parent
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