// src/components/score-dialog.tsx
'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy } from 'lucide-react';

interface ScoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (score: number) => void;
  testName: string;
}

export function ScoreDialog({ isOpen, onOpenChange, onSave, testName }: ScoreDialogProps) {
  const [score, setScore] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 720) {
      setError('Please enter a valid score between 0 and 720.');
      return;
    }
    onSave(scoreNum);
    setScore('');
    setError('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setScore('');
    setError('');
    onOpenChange(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-heading">
            Enter Your Score
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Log your score for the <span className="font-semibold text-foreground">{testName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="score">Score (out of 720)</Label>
                <Input
                    id="score"
                    type="number"
                    placeholder="e.g. 650"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    max={720}
                    min={0}
                />
                 {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>
            Save Score
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
