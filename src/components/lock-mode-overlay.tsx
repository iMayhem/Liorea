// src/components/lock-mode-overlay.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkullIcon } from './icons';


export function LockModeOverlay() {
  const { isFocusMode, setIsFocusMode, isBeastModeLocked } = useStudyRoom();

  const showOverlay = isFocusMode || isBeastModeLocked;

  if (!showOverlay) {
    return null;
  }

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm'
          )}
        >
          {isBeastModeLocked ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 10 } }}
                className="flex flex-col items-center gap-4"
              >
                  <SkullIcon className="h-24 w-24 text-red-500 animate-pulse" />
                  <p className="text-2xl font-bold font-heading text-red-400">BEAST MODE ON</p>
              </motion.div>
          ) : (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10"
                onClick={() => setIsFocusMode(false)}
            >
                <X className="h-8 w-8" />
                <span className="sr-only">Exit Focus Mode</span>
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
