import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Clock } from 'lucide-react';
import { OnlineUser } from '@/context/PresenceContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface LeaderboardProps {
  users: OnlineUser[];
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export default function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => (b.totalStudyTime || 0) - (a.totalStudyTime || 0));

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
           const avatarUrl = PlaceHolderImages[index % PlaceHolderImages.length]?.imageUrl || '';
          return (
            <div key={user.username} className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-6 font-bold ${getRankColor(index)}`}>
                {index < 3 ? <Award className="w-5 h-5" /> : <span className="text-sm">#{index + 1}</span>}
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl} alt={user.username} data-ai-hint="person portrait" />
                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{user.username}</p>
              </div>
              <div className="font-mono text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(user.totalStudyTime || 0)}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
