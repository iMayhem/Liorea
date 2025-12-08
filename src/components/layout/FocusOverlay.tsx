
"use client";

import { useFocus } from '@/context/FocusContext';
import { cn } from '@/lib/utils';

export default function FocusOverlay() {
  const { isFocusMode } = useFocus();

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-500 pointer-events-none",
        isFocusMode ? "opacity-100" : "opacity-0"
      )}
    />
  );
}
