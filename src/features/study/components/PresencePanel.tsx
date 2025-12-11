import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/utils/utils';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { CommunityUser } from '@/shared/context/PresenceContext';
import { Users, BookOpen } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import UserAvatar from '@/shared/components/UserAvatar';

interface PresencePanelProps {
  users: CommunityUser[];
}

const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "Offline";
    const minsAgo = Math.floor((Date.now() - timestamp) / 60000);
    if (minsAgo < 1) return "just now";
    if (minsAgo < 60) return `${minsAgo}m ago`;
    const hoursAgo = Math.floor(minsAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
}

export default function PresencePanel({ users }: PresencePanelProps) {
  const onlineCount = users.filter(u => u.status === 'Online').length;

  return (
    // UPDATED CLASSNAME:
    <Card className="glass-panel text-white w-72 h-[500px] flex flex-col rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 shrink-0 glass-panel-light">
            <div className="flex items-center gap-3">
                <Users className="text-white/80 w-5 h-5" />
                <CardTitle className="text-base text-white font-semibold">Community</CardTitle>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/10 text-white/80 text-xs h-7 px-3 rounded-full hover:bg-white/20 border border-white/5">
                {onlineCount} Online
            </Button>
        </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full px-4">
            <div className="space-y-4 py-4">
            {users.map((user) => {
            const isOnline = user.status === 'Online';
            const lastSeen = getTimeAgo(user.last_seen);
            
            return (
                <div key={user.username} className="flex items-center gap-3 group">
                <div className="relative">
                    <UserAvatar username={user.username} className="w-9 h-9" />
                    
                    <span className={cn(
                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-black z-10",
                        isOnline ? "bg-green-500" : "bg-gray-500"
                    )} />
                </div>
                
                <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className={cn("font-semibold text-sm truncate transition-colors", isOnline ? "text-white" : "text-white/60")}>
                            {user.username}
                        </p>
                        {user.is_studying && isOnline && (
                             <BookOpen className="w-3 h-3 text-accent animate-pulse" />
                        )}
                    </div>

                    {user.status_text ? (
                       <p className="text-xs text-white/70 italic truncate">
                         {user.status_text}
                       </p>
                    ) : (
                       <p className={cn("text-xs", isOnline ? "text-green-400/80" : "text-gray-400")}>
                         {isOnline ? (user.is_studying ? 'Studying' : 'Online') : lastSeen}
                       </p>
                    )}
                </div>
                </div>
            )
            })}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}