import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Trophy } from 'lucide-react';
import { StudyUser } from '@/features/study';
import UserAvatar from '@/components/UserAvatar';

interface LeaderboardProps {
  users: StudyUser[];
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => (b.total_study_time || 0) - (a.total_study_time || 0));

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-orange-400';
    return 'text-muted-foreground';
  }

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="text-accent w-4 h-4" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {sortedUsers.map((user, index) => {
          return (
            <div key={user.username} className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-6 font-bold ${getRankColor(index)}`}>
                {index < 3 ? <Award className="w-5 h-5" /> : <span className="text-sm">#{index + 1}</span>}
              </div>
              <UserAvatar username={user.username} className="w-10 h-10" />
              <div className="flex-grow">
                <p className="font-semibold">{user.username}</p>
              </div>
              <div className="font-mono text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(user.total_study_time || 0)}
              </div>
            </div>
          )
        })}
        {sortedUsers.length === 0 && (
          <p className="text-center text-white/50 text-sm">No one is studying right now.</p>
        )}
      </CardContent>
    </Card>
  );
}