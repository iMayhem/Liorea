import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { OnlineUser, usePresence } from '@/context/PresenceContext';

interface PresencePanelProps {
  users: OnlineUser[];
}

const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return null;
    const minsAgo = Math.floor((Date.now() - timestamp) / 60000);
    if (minsAgo < 1) return "just now";
    if (minsAgo < 60) return `${minsAgo}m ago`;
    const hoursAgo = Math.floor(minsAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
}

export default function PresencePanel({ users }: PresencePanelProps) {

  return (
    <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="p-4">
            <CardTitle className="text-base text-white">All Users ({users.length})</CardTitle>
        </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-72">
            <div className="space-y-4">
            {users.map((user, index) => {
            const avatarUrl = PlaceHolderImages[index % PlaceHolderImages.length]?.imageUrl || '';
            const isOnline = user.status === 'Online';
            return (
                <div key={user.username} className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="w-9 h-9">
                    <AvatarImage src={avatarUrl} alt={user.username} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background",
                        isOnline ? "bg-green-500" : "bg-gray-500"
                    )} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-white text-sm">{user.username}</p>
                    <p className={cn("text-xs", isOnline ? "text-green-400" : "text-gray-400")}>
                      {isOnline ? 'Online' : `Offline (${getTimeAgo(user.last_seen)})`}
                    </p>
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
