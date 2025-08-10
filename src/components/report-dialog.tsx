// src/components/report-dialog.tsx
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ isOpen, onOpenChange }: ReportDialogProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
    }


    const handleSubmit = async () => {
        if (!user || !profile?.username || !title || !description) {
            toast({
                title: 'Missing Fields',
                description: 'Please provide a title and description.',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);

        try {

             // Save report to Firestore
            await addDoc(collection(db, 'reports'), {
                userId: user.uid,
                username: profile.username,
                title,
                description,
                timestamp: serverTimestamp(),
                status: 'open',
            });

            toast({
                title: 'Report Submitted',
                description: 'Thank you for your feedback!',
            });
            resetForm();
            onOpenChange(false);

        } catch (error) {
            console.error("Error submitting report: ", error);
            toast({
                title: 'Submission Failed',
                description: 'Could not submit your report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
        if(!open) resetForm();
        onOpenChange(open);
    }}>
      <AlertDialogContent className="card">
        <AlertDialogHeader>
          <AlertDialogTitle>Report an Issue or Suggestion</AlertDialogTitle>
          <AlertDialogDescription>
            Your feedback helps us improve the app. Please provide as much detail as possible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="report-title">Title</Label>
                <Input 
                    id="report-title"
                    placeholder="e.g., Bug in leaderboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                    id="report-description"
                    placeholder="Please describe the issue or your suggestion..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                />
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={resetForm}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
