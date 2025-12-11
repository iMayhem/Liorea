"use client";

import { useFocus } from '@/shared/context/FocusContext';
import { cn } from '@/shared/utils/utils';
import { X } from 'lucide-react';

export default function FocusOverlay() {
  const { isFocusMode, toggleFocusMode } = useFocus();

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-500",
        isFocusMode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {isFocusMode && (
        <button
          onClick={toggleFocusMode}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
          aria-label="Exit focus mode"
        >
          <X className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
