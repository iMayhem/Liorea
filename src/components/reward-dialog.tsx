// src/components/reward-dialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Trophy} from 'lucide-react';
import {motion} from 'framer-motion';

interface RewardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RewardDialog({isOpen, onOpenChange}: RewardDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, -10, 0],
                scale: [1, 1.1, 1.2, 1.1, 1],
              }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Trophy className="h-16 w-16 text-yellow-400" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center text-2xl font-heading">
            Day Complete!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Congratulations! You've completed all your tasks for today.
            Keep up the amazing work. Your consistency is your greatest
            strength.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
