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

interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ isOpen, onOpenChange }: ReportDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [image, setImage] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImage(null);
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!user || !title || !description) {
            toast({
                title: 'Missing Fields',
                description: 'Please provide a title and description.',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);

        try {
            let imageUrl: string | null = null;
            if (image) {
                 // Upload image to Firebase Storage
                const storage = getStorage();
                const storageRef = ref(storage, `reports/${user.uid}/${Date.now()}`);
                const snapshot = await uploadString(storageRef, image, 'data_url');
                imageUrl = await getDownloadURL(snapshot.ref);
            }

             // Save report to Firestore
            await addDoc(collection(db, 'reports'), {
                userId: user.uid,
                username: user.username,
                title,
                description,
                imageUrl,
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
      <AlertDialogContent>
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
             <div className="space-y-2">
                <Label>Attach Screenshot (Optional)</Label>
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                 />
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {image ? 'Change Image' : 'Upload Image'}
                 </Button>
                 {image && <p className="text-sm text-muted-foreground">Image selected.</p>}
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
