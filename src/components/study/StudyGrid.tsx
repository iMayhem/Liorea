import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users } from 'lucide-react';
import { OnlineUser } from '@/context/PresenceContext';

interface StudyGridProps {
  users: OnlineUser[];
}

const formatTime = (seconds: number = 0) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

const getUserColor = (username: string) => {
    const charCodeSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return USER_COLORS[charCodeSum % USER_COLORS.length];
};

export default function StudyGrid({ users }: StudyGridProps) {
  const onlineUsers = users.filter(u => u.status === 'Online');
  
  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/30 text-white w-full h-[500px]">
        <CardHeader className="p-4 border-b border-white/20">
            <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Study Room ({onlineUsers.length})
            </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {onlineUsers.map((user) => {
            return (
            <Card key={user.username} className="overflow-hidden bg-card/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 flex flex-col items-center justify-center gap-2 text-center">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarFallback className={`${getUserColor(user.username)} text-white`}>{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold truncate w-full text-sm">{user.username}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3"/>
                    <span>{formatTime(user.total_study_time)}</span>
                </div>
                </CardContent>
            </Card>
            );
        })}
        </div>
      </CardContent>
    </Card>
  );
}