import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { User } from '@/lib/mock-data';

interface PresencePanelProps {
  users: User[];
}

export default function PresencePanel({ users }: PresencePanelProps) {
  const sortedUsers = [...users].sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="p-4">
            <CardTitle className="text-lg text-white">Online Users</CardTitle>
        </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-72">
            <div className="space-y-4">
            {sortedUsers.map((user) => {
            const avatarUrl = PlaceHolderImages.find(p => p.id === user.avatarImageId)?.imageUrl || '';
            const isOnline = user.status === 'online';
            return (
                <div key={user.id} className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                    "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background",
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                    )} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className={cn("text-xs", isOnline ? 'text-green-400' : 'text-muted-foreground')}>
                    {isOnline ? 'Online' : `Last seen ${user.lastSeen}`}
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
