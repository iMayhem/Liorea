'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { submitReport } from '@/lib/db'; // Updated import
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

    const handleClose = () => { setTitle(''); setDescription(''); onOpenChange(false); };

    const handleSubmit = async () => {
        if (!user || !profile?.username || !title || !description) return;
        setIsSubmitting(true);
        try {
            await submitReport({ userId: user.uid, username: profile.username, title, description });
            toast({ title: 'Report Submitted', description: 'Thank you for your feedback!' });
            handleClose();
        } catch (error) {
            toast({ title: 'Submission Failed', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Report Issue</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={handleClose}><X className="h-4 w-4"/></Button>
                                </div>
                                <CardDescription>Help us improve.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} /></div>
                                <div className="flex justify-end"><Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Submit</Button></div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}