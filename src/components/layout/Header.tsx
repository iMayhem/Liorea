"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bell, BookOpenCheck, Home, NotebookText } from 'lucide-react';
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
        <Link href="/home" className={cn(
          "flex items-center gap-2 text-xl font-bold tracking-tight",
          'text-white'
        )}>
          <BookOpenCheck className="w-7 h-7" />
          Liorea
        </Link>
        <nav className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-black/20 backdrop-blur-md border-white/20 text-white" align="end">
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
                                        "mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors",
                                        !notification.read && "font-semibold bg-white/5"
                                    )}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (notification.link) {
                                            window.location.href = notification.link;
                                        }
                                    }}
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

          <Link href="/home" className={cn(
            "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
            'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
            pathname === '/home' && 'bg-white/10 text-white'
          )}>
            <Home className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link href="/study-together" className={cn(
            "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
            'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
            pathname === '/study-together' && 'bg-white/10 text-white'
          )}>
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Study Room</span>
          </Link>

          <Link href="/journal" className={cn(
            "flex items-center gap-2 py-1.5 px-3 rounded-full transition-colors text-sm",
            'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm',
            pathname === '/journal' && 'bg-white/10 text-white'
          )}>
            <NotebookText className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Journal</span>
          </Link>

        </nav>
      </div>
    </header>
  );
}