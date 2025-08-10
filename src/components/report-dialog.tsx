// src/components/report-dialog.tsx
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

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
            handleClose();

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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10"
                        onClick={handleClose}
                    >
                        <X className="h-8 w-8" />
                        <span className="sr-only">Close</span>
                    </Button>
                    
                    <motion.div
                         initial={{ scale: 0.95, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.95, opacity: 0 }}
                         transition={{ duration: 0.2 }}
                         className="w-full max-w-lg"
                    >
                        <Card className="card">
                             <CardHeader>
                                <CardTitle>Report an Issue or Suggestion</CardTitle>
                                <CardDescription>
                                    Your feedback helps us improve the app. Please provide as much detail as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}