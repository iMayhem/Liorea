import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type User = {
  id: number;
  name: string;
  avatarImageId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
};

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
    <Card>
      <CardContent className="p-4 space-y-4">
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
                <p className="font-semibold">{user.name}</p>
                <p className={cn("text-xs", isOnline ? 'text-green-400' : 'text-muted-foreground')}>
                  {isOnline ? 'Online' : `Last seen ${user.lastSeen}`}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
