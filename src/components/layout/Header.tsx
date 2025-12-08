"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bell, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export default function Header() {
  const pathname = usePathname();
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-30 p-4",
      "bg-transparent"
    )}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className={cn(
          "flex items-center gap-2 text-2xl font-bold tracking-tight",
          'text-white'
        )}>
          <BookOpen className="w-7 h-7" />
          Liorea
        </Link>
        <nav className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full relative">
                    <Bell />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                            Recent announcements from the admins.
                        </p>
                    </div>
                     <Separator />
                    <ScrollArea className="h-72">
                        {notifications.length > 0 ? (
                            <div className="grid gap-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0",
                                        !notification.read && "font-semibold"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                <span className={cn("flex h-2 w-2 translate-y-1 rounded-full", !notification.read ? "bg-sky-500" : "bg-transparent")} />
                                <div className="space-y-1">
                                    <p className="text-sm leading-snug">
                                     {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                </div>
                            ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No new notifications.</p>
                        )}
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>

          <Link href="/study-together" className={cn(
            "flex items-center gap-2 py-2 px-4 rounded-full transition-colors",
            'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm'
          )}>
            <Sparkles className="w-5 h-5 text-accent" />
            Study Together
          </Link>
        </nav>
      </div>
    </header>
  );
}
