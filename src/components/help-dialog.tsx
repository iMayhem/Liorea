// src/components/help-dialog.tsx
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { X, Calendar, Users, Music, Trophy, MessageSquare, AlertTriangle, Settings, HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ isOpen, onOpenChange }: HelpDialogProps) {
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
                         className="w-full max-w-2xl"
                    >
                        <Card className="card max-h-[90vh] flex flex-col">
                             <CardHeader className="text-center">
                                <div className="flex justify-center mb-2">
                                    <HelpCircle className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="font-heading text-3xl">Liorea.life Guide</CardTitle>
                                <CardDescription>
                                    Arre, confused? No problem! Here’s a simple guide to everything on the site.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full pr-4">
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    
                                    <AccordionItem value="item-1" className="border-b-0">
                                        <AccordionTrigger className="p-4 bg-muted/40 rounded-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-primary"/>
                                                <span className="font-bold">The Main Page (Dashboard)</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 text-muted-foreground">
                                            This is your command center, boss! The big calendar shows your study progress. Days you study will get colored in—the more you study, the darker the color. Just click on any date to see or update your schedule for that day. Simple.
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="item-2" className="border-b-0">
                                        <AccordionTrigger className="p-4 bg-muted/40 rounded-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Users className="h-5 w-5 text-primary"/>
                                                <span className="font-bold">Study Together Rooms</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 text-muted-foreground">
                                            This is the main deal. Create a private room for your group or join the public one. Inside you'll find:
                                            <br/>- **Pomodoro Timer:** A shared timer to keep everyone in sync. Focus when it's study time, relax when it's break time. Full focus, no bakwaas.
                                            <br/>- **Collaborative Notepad:** Ek shared notepad hai jahan everyone can write notes together. Great for discussing topics or making quick points.
                                            <br/>- **Group Chat:** For all your important discussions, doubt-solving, or just cheering each other on.
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="item-3" className="border-b-0">
                                        <AccordionTrigger className="p-4 bg-muted/40 rounded-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Music className="h-5 w-5 text-primary"/>
                                                <span className="font-bold">Party (Watch Together)</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 text-muted-foreground">
                                            Padhai se thak gaye? Take a break. In the Party section, you can watch YouTube videos with your friends in real-time. Everything is perfectly in sync. Search for any song or video and chill together.
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="item-4" className="border-b-0">
                                        <AccordionTrigger className="p-4 bg-muted/40 rounded-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Trophy className="h-5 w-5 text-primary"/>
                                                <span className="font-bold">Floating Buttons (Right Corner)</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 text-muted-foreground">
                                            Yeh neeche right side mein teen buttons hain:
                                            <br/>- **Trophy:** This opens the Leaderboard. See who is studying the most today or all-time. Thoda competition hona chahiye!
                                            <br/>- **Chat Icon:** This is for your private chats with other users. If you have a new message, a dot will appear.
                                            <br/>- **Warning Icon:** Found a bug? Koi problem hai? Use this button to report an issue or give a suggestion. Your feedback is super important.
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="item-5" className="border-b-0">
                                        <AccordionTrigger className="p-4 bg-muted/40 rounded-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-5 w-5 text-primary"/>
                                                <span className="font-bold">Settings and Customization</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 text-muted-foreground">
                                           Aap site ko apne hisaab se set kar sakte ho:
                                           <br/>- **Gear Icon (Home Page):** This lets you customize your weekly timetable. Set your subjects and tasks for each day.
                                           <br/>- **Admins can change the background** for all users from the admin panel.
                                        </AccordionContent>
                                    </AccordionItem>

                                </Accordion>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
