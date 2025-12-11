"use client";

import { cn } from "@/lib/utils";
import { forwardRef, UIEvent } from "react";

interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hideScrollbar?: boolean;
  thin?: boolean;
  horizontal?: boolean;
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
}

export const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  ({ className, children, hideScrollbar, thin, horizontal, onScroll, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        className={cn(
          // 'absolute inset-0' ensures it strictly fills the relative parent without expanding it
          "absolute inset-0 w-full h-full", 
          
          horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
          
          hideScrollbar ? "no-scrollbar" : "custom-scrollbar",
          (thin && !hideScrollbar) && "thin-scrollbar",
          
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