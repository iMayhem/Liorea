import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type User = {
  id: number;
  name: string;
  avatarImageId: string;
  studyTime: number; // in minutes
};

interface StudyGridProps {
  users: User[];
}

const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

export default function StudyGrid({ users }: StudyGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {users.map(user => {
        const avatarUrl = PlaceHolderImages.find(p => p.id === user.avatarImageId)?.imageUrl || '';
        return (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold truncate w-full">{user.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3"/>
                  <span>{formatTime(user.studyTime)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
