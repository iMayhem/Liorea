"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ChatLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode; // The Scrollable list goes here
  footer?: React.ReactNode;  // The Input bar goes here
  className?: string;
  backgroundImage?: string; // Optional: If you want specific journal art later
}

export function ChatLayout({ header, children, footer, className }: ChatLayoutProps) {
  return (
    <div className={cn("flex flex-col w-full h-full overflow-hidden relative", className)}>
      
      {/* 1. HEADER: Fixed Height, never shrinks */}
      {header && (
        <header className="flex-none z-20 w-full">
          {header}
        </header>
      )}
      
      {/* 2. CONTENT: Fills remaining space, handles scroll internally */}
      <main className="flex-1 min-h-0 relative z-0 w-full">
        {children}
      </main>
      
      {/* 3. FOOTER: Fixed Height, never shrinks, sits above content */}
      {footer && (
        <footer className="flex-none z-20 w-full">
          {footer}
        </footer>
      )}
    </div>
  );
}