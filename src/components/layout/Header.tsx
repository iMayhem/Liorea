"use client";


import Link from 'next/link';
import { Sparkles, Bell, BookOpenCheck, Home, NotebookText, CheckCheck, Bug, Loader2, ShoppingBag, Wand2, Brain, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import UserAvatar from '@/components/UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePresence } from '@/features/study';
import { AppearanceSettings } from '@/features/settings/components/AppearanceSettings';
import { Settings, Palette } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
    const pathname = usePathname();
    const { userNotifications, globalNotifications, markAsRead, markAllAsRead } = useNotifications();
    const unreadPersonalCount = userNotifications.filter(n => !n.read).length;
    const unreadGlobalCount = globalNotifications.filter(n => !n.read).length;

    // Beautiful Mode State
    const [isBeautifulMode, setIsBeautifulMode] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('beautiful-mode');
        if (stored === 'true') {
            setIsBeautifulMode(true);
            document.documentElement.classList.add('beautiful-mode');
        }
    }, []);

    const toggleBeautifulMode = () => {
        const newValue = !isBeautifulMode;
        setIsBeautifulMode(newValue);
        if (newValue) {
            document.documentElement.classList.add('beautiful-mode');
            localStorage.setItem('beautiful-mode', 'true');
        } else {
            document.documentElement.classList.remove('beautiful-mode');
            localStorage.setItem('beautiful-mode', 'false');
        }
    };

    // Feedback/Bug Report State
    const { username } = usePresence();
    const { toast } = useToast();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) return;
        setIsSubmitting(true);
        try {
            await push(ref(db, 'feedback'), {
                reporter: username || 'Anonymous',
                message: feedbackText.trim(),
                timestamp: serverTimestamp(),
                type: 'bug_or_suggestion',
                status: 'open'
            });
            toast({ title: "Feedback Sent", description: "Thanks for helping us improve Liorea!" });
            setFeedbackText("");
            setIsFeedbackOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not send report. Try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-30 px-4 h-[72px] flex items-center",
                "border-b border-white/5 transition-colors duration-500",
                "bg-background/60 backdrop-blur-xl"
            )}
        >
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/home" className={cn(
                    "flex items-center gap-2 text-xl font-bold tracking-tight",
                    'text-white'
                )}>
                    <BookOpenCheck className="w-7 h-7" />
                    Liorea
                </Link>
                <nav className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-discord-text-muted hover:bg-discord-gray hover:text-discord-text rounded-full" title="Appearance">
                                <Palette className="w-5 h-5 text-white/80" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[85vh] p-0 bg-background border-border overflow-hidden rounded-xl">
                            <AppearanceSettings />
                        </DialogContent>
                    </Dialog>

                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="text-discord-text-muted hover:bg-discord-gray hover:text-discord-text rounded-full" title="Settings">
                            <Settings className="w-5 h-5 text-white/80" />
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleBeautifulMode}
                        className={cn("text-white hover:bg-white/20 hover:text-white rounded-full transition-all duration-300", isBeautifulMode && "bg-white/20 text-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)]")}
                        title="Beautiful Mode"
                    >
                        <Wand2 className="w-5 h-5" />
                    </Button>

                    {/* BUG REPORT / FEEDBACK BUTTON */}
                    <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" title="Report Bug / Suggestion">
                                <Bug className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Report Bug or Suggestion</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Found a glitch or have an idea? Let us know below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Textarea
                                    placeholder="Describe the bug or your suggestion..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    className="bg-black/20 border-white/20 text-white min-h-[120px] focus-visible:ring-offset-0 focus-visible:ring-white/30"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSubmitFeedback}
                                    disabled={isSubmitting || !feedbackText.trim()}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Submit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* GLOBAL NOTIFICATIONS (Megaphone) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full relative" title="Global Broadcasts">
                                <Megaphone className="w-5 h-5" />
                                {unreadGlobalCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-black/20 backdrop-blur-md border-white/20 text-white" align="end">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium leading-none flex items-center gap-2">
                                        <Megaphone className="w-4 h-4 text-accent" />
                                        <span>System Broadcasts</span>
                                    </h4>
                                </div>
                                <Separator className="bg-white/10" />
                                <div className="flex h-full flex-col">
                                    <ScrollArea className="h-72">
                                        {globalNotifications.length > 0 ? (
                                            <div className="grid gap-2">
                                                {globalNotifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={cn(
                                                            "mb-2 grid grid-cols-[auto_1fr] gap-3 items-start pb-4 last:mb-0 last:pb-0 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors",
                                                            !notification.read && "bg-white/10"
                                                        )}
                                                        onClick={() => {
                                                            markAsRead(notification.id);
                                                            if (notification.link) {
                                                                window.location.href = notification.link;
                                                            }
                                                        }}
                                                    >
                                                        <div className="relative mt-1">
                                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                                                <Sparkles className="w-4 h-4 text-accent" />
                                                            </div>
                                                            {!notification.read && (
                                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
                                                            )}
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-white' : 'text-white/80'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {new Date(notification.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-8">No global interrupts.</p>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* PERSONAL NOTIFICATIONS (Bell) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full relative" title="Notifications">
                                <Bell className="w-5 h-5" />
                                {unreadPersonalCount > 0 && (
                                    <span className="absolute top-0 right-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-black/20 backdrop-blur-md border-white/20 text-white" align="end">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium leading-none">Notifications</h4>
                                    {userNotifications.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={markAllAsRead}
                                            className="h-6 text-[10px] px-2 text-white/50 hover:text-accent hover:bg-white/10"
                                        >
                                            <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                                        </Button>
                                    )}
                                </div>
                                <Separator className="bg-white/10" />
                                <div className="flex h-full flex-col">
                                    <ScrollArea className="h-72">
                                        {userNotifications.length > 0 ? (
                                            <div className="grid gap-2">
                                                {userNotifications.map((notification) => {
                                                    const fromUser = notification.message.split(' ')[0];
                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={cn(
                                                                "mb-2 grid grid-cols-[auto_1fr] gap-3 items-start pb-4 last:mb-0 last:pb-0 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors",
                                                                !notification.read && "bg-white/5"
                                                            )}
                                                            onClick={() => {
                                                                markAsRead(notification.id);
                                                                if (notification.link) {
                                                                    window.location.href = notification.link;
                                                                }
                                                            }}
                                                        >
                                                            <div className="relative mt-1">
                                                                <UserAvatar username={fromUser} className="w-8 h-8" />
                                                                {!notification.read && (
                                                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-black" />
                                                                )}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-white' : 'text-white/80'}`}>
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {new Date(notification.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-8">No new notifications.</p>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Link href="/home" className={cn(
                        "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
                        'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
                        pathname === '/home' && 'bg-white/10 text-white'
                    )}>
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>

                    <Link href="/personal" className={cn(
                        "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
                        'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
                        pathname === '/personal' && 'bg-white/10 text-white'
                    )}>
                        <Brain className="w-4 h-4" />
                        <span className="hidden sm:inline">Personal</span>
                    </Link>

                    <Link href="/study-together" className={cn(
                        "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
                        'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
                        pathname === '/study-together' && 'bg-white/10 text-white'
                    )}>
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Study Room</span>
                    </Link>

                    <Link href="/journal" className={cn(
                        "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
                        'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
                        pathname === '/journal' && 'bg-white/10 text-white'
                    )}>
                        <NotebookText className="w-4 h-4" />
                        <span className="hidden sm:inline">Journal</span>
                    </Link>

                </nav>
            </div>
        </header>
    );
}