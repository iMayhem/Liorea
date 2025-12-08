import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { User } from '@/lib/mock-data';

interface LeaderboardProps {
  users: User[];
}

const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

export default function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.studyTime - a.studyTime);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-orange-400';
    return 'text-muted-foreground';
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {sortedUsers.map((user, index) => {
           const avatarUrl = PlaceHolderImages.find(p => p.id === user.avatarImageId)?.imageUrl || '';
          return (
            <div key={user.id} className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-6 font-bold ${getRankColor(index)}`}>
                {index < 3 ? <Award className="w-5 h-5" /> : <span className="text-sm">#{index + 1}</span>}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{user.name}</p>
              </div>
              <div className="font-mono text-sm text-muted-foreground">
                {formatTime(user.studyTime)}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
