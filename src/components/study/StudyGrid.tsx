import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { OnlineUser } from '@/context/PresenceContext';

interface StudyGridProps {
  users: OnlineUser[];
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export default function StudyGrid({ users }: StudyGridProps) {
  const onlineUsers = users.filter(u => u.status === 'Online');
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {onlineUsers.map((user, index) => {
        const avatarUrl = PlaceHolderImages[index % PlaceHolderImages.length]?.imageUrl || '';
        return (
          <Card key={user.username} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={avatarUrl} alt={user.username} data-ai-hint="person portrait" />
                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold truncate w-full">{user.username}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3"/>
                  <span>{formatTime(user.totalStudyTime || 0)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
