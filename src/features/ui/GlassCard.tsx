import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'panel-light' | 'ghost' | 'interactive';
  noPadding?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'panel', 
  noPadding = false,
  ...props 
}: GlassCardProps) {
  
  // Base classes mapping to your global CSS utilities
  const variants = {
    'panel': "glass-panel rounded-2xl border border-white/10 shadow-xl", // Heavy blur (Main containers)
    'panel-light': "glass-panel-light border-b border-white/5", // Light blur (Headers/Footers)
    'ghost': "bg-white/5 border border-white/5 rounded-lg", // Inner cards
    'interactive': "glass-panel rounded-xl border border-white/10 hover:bg-black/40 transition-all cursor-pointer" // Clickable cards
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden text-white transition-colors",
        variants[variant],
        !noPadding && "p-4",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}