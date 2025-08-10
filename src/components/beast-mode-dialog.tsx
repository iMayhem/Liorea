// src/components/beast-mode-dialog.tsx
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useStudyRoom } from '@/hooks/use-study-room';
import { useToast } from '@/hooks/use-toast';
import { Flame, Loader2 } from 'lucide-react';

interface BeastModeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BeastModeDialog({ isOpen, onOpenChange }: BeastModeDialogProps) {
    const { toggleBeastMode } = useStudyRoom();
    const { toast } = useToast();
    const [confirmationText, setConfirmationText] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const isConfirmationMatch = confirmationText === 'confirm';

    const handleConfirm = () => {
        if (!isConfirmationMatch) {
             toast({
                title: 'Confirmation failed',
                description: 'Please type "confirm" to start Beast Mode.',
                variant: 'destructive',
            });
            return;
        }
        
        setIsSubmitting(true);
        try {
            toggleBeastMode();
            toast({
                title: 'Beast Mode Activated!',
                description: 'Time to focus. You are locked in for 25 minutes.',
            });
            onOpenChange(false);
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Could not activate Beast Mode. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
            setConfirmationText('');
        }
    };

    const handleCancel = () => {
        setConfirmationText('');
        onOpenChange(false);
    }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="card">
        <AlertDialogHeader>
            <div className="flex justify-center">
                <Flame className="h-12 w-12 text-destructive"/>
            </div>
          <AlertDialogTitle className="text-center font-heading text-2xl">Activate Beast Mode?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This will lock you out of all interactive features like chat and sound controls for **25 minutes**.
            You will be redirected to your home page to focus. This action cannot be undone once started.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="beast-confirm">Type **confirm** to continue</Label>
                <Input 
                    id="beast-confirm"
                    placeholder="confirm"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                />
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!isConfirmationMatch || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Beast Mode
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
