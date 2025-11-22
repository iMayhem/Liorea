'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisplayUser {
    uid: string;
    username: string | null;
    photoURL: string | null;
    isOnline: boolean;
    lastSeen?: string;
}

export function UserActivityList() {
  const [displayUsers, setDisplayUsers] = React.useState<DisplayUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    let presenceChannel: any = null;
    let dbChannel: any = null;

    const fetchAndSubscribe = async () => {
        // 1. Initial Fetch of All Users
        const { data: allUsers, error } = await supabase
            .from('users')
            .select('id, username, photo_url, last_seen')
            .order('username');

        if (error || !allUsers) {
            if (mounted) setLoading(false);
            return;
        }

        // Helper to process and sort users
        const processUsers = (onlineIds: Set<string>, userList: any[]) => {
            const now = new Date().getTime();
            const merged = userList.map(u => {
                // Method A: Realtime Presence (Instant)
                const isRealtimeOnline = onlineIds.has(u.id);
                
                // Method B: Database Fallback (Robust) - Active in last 5 mins
                const lastSeenTime = u.last_seen ? new Date(u.last_seen).getTime() : 0;
                const isDbOnline = (now - lastSeenTime) < (5 * 60 * 1000);

                return {
                    uid: u.id,
                    username: u.username || 'Anonymous',
                    photoURL: u.photo_url,
                    isOnline: isRealtimeOnline || isDbOnline,
                    lastSeen: u.last_seen
                };
            });

            // Sort: Online first, then alphabetical
            merged.sort((a, b) => {
                if (a.isOnline === b.isOnline) return a.username!.localeCompare(b.username!);
                return a.isOnline ? -1 : 1;
            });

            if (mounted) {
                setDisplayUsers(merged);
                setLoading(false);
            }
        };

        // Initial Processing (Empty presence initially, rely on DB last_seen)
        processUsers(new Set(), allUsers);

        // 2. Subscribe to Realtime Presence
        presenceChannel = supabase.channel('global_presence');
        
        const updateFromPresence = () => {
            if (!mounted) return;
            const state = presenceChannel.presenceState();
            const onlineIds = new Set(
                Object.values(state)
                    .flat()
                    .map((u: any) => u.uid)
            );
            processUsers(onlineIds, allUsers);
        };

        presenceChannel
            .on('presence', { event: 'sync' }, updateFromPresence)
            .on('presence', { event: 'join' }, updateFromPresence)
            .on('presence', { event: 'leave' }, updateFromPresence)
            .subscribe((status: string) => {
                console.log(`[ActivityList] Presence Status: ${status}`);
                if (status === 'TIMED_OUT') {
                    // If timed out, we just rely on the DB listener below
                    console.warn("[ActivityList] Presence timed out, switching to DB fallback.");
                }
            });

        // 3. Subscribe to Database Changes (The Backup Plan)
        // If a user updates their 'last_seen', we catch it here even if Presence fails
        dbChannel = supabase.channel('public:users')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload: any) => {
                if (!mounted) return;
                // Update the specific user in our list
                const updatedUser = payload.new;
                const userIndex = allUsers.findIndex(u => u.id === updatedUser.id);
                
                if (userIndex >= 0) {
                    allUsers[userIndex] = updatedUser;
                } else {
                    allUsers.push(updatedUser); // New user?
                }
                
                // Re-process list
                const state = presenceChannel.presenceState();
                const onlineIds = new Set(Object.values(state).flat().map((u: any) => u.uid));
                processUsers(onlineIds, allUsers);
            })
            .subscribe();
    };

    fetchAndSubscribe();

    return () => {
        mounted = false;
        if (presenceChannel) supabase.removeChannel(presenceChannel);
        if (dbChannel) supabase.removeChannel(dbChannel);
    };
  }, []);

  if (loading) return <Skeleton className="h-full w-full" />;

  return (
    <Card className="w-full h-full shadow-md flex flex-col bg-background/60 backdrop-blur-sm border-border/50">
      <CardHeader className="flex-shrink-0 pb-3 pt-4 px-4 border-b border-border/40">
        <CardTitle className="flex items-center justify-between text-sm font-heading">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary"/> 
                <span>Community</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {displayUsers.filter(u => u.isOnline).length} Online
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
                {displayUsers.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No users found.</p>
                )}
                {displayUsers.map((user) => (
                    <div key={user.uid} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/40 transition-all group">
                         <div className="relative">
                            <Avatar className={cn("h-8 w-8 border-2 transition-colors", user.isOnline ? "border-green-500/50" : "border-transparent")}>
                                <AvatarImage src={user.photoURL || ''} />
                                <AvatarFallback className="text-xs">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className={cn("absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background", user.isOnline ? "bg-green-500" : "bg-gray-400")} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <p className="font-semibold text-xs truncate text-foreground/90">{user.username}</p>
                            <p className={cn("text-[10px] truncate", user.isOnline ? "text-green-600 font-medium" : "text-muted-foreground")}>
                                {user.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>
      </CardContent>
    </Card>
  );
}