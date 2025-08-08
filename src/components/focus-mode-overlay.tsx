// src/components/focus-mode-overlay.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FocusModeOverlay() {
  const { isFocusMode, setIsFocusMode } = useStudyRoom();

  if (!isFocusMode) {
    return null;
  }

  return (
    <AnimatePresence>
      {isFocusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10"
            onClick={() => setIsFocusMode(false)}
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Exit Focus Mode</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
