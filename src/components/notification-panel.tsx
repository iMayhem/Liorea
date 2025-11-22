// src/components/notification-panel.tsx
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { X, Bell, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNowStrict } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({ isOpen, onOpenChange }: NotificationPanelProps) {
    const { notifications, loading } = useNotifications();

    const handleClose = () => {
        onOpenChange(false);
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
                        <Card className="card max-h-[90vh] flex flex-col">
                             <CardHeader className="text-center">
                                <div className="flex justify-center mb-2">
                                    <Bell className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="font-heading text-3xl">Notifications</CardTitle>
                                <CardDescription>
                                    Recent announcements and updates.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-[60vh] pr-4">
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : notifications.length > 0 ? (
                                    <div className="space-y-4">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className="p-4 rounded-lg bg-muted/40 border border-border/50">
                                                <p className="text-sm whitespace-pre-wrap">{notif.message}</p>
                                                <p className="text-xs text-muted-foreground mt-2 text-right">
                                                    {formatDistanceToNowStrict(notif.timestamp.toDate(), { addSuffix: true })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground pt-10">No new notifications.</p>
                                )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
