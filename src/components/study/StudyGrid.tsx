import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Users } from 'lucide-react';
import { StudyUser } from '@/context/PresenceContext';
import { ScrollArea } from '../ui/scroll-area';

interface StudyGridProps {
  users: StudyUser[];
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
  // Sort users so people with same name stick together (or just simple sorting)
  const sortedUsers = [...users].sort((a, b) => a.username.localeCompare(b.username));
  
  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white w-full h-[480px]">
        <CardHeader className="p-4 border-b border-white/20">
            <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Study Room ({sortedUsers.length})
            </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-[calc(480px-61px)]">
        <ScrollArea className="h-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedUsers.map((user) => {
                return (
                <Card key={user.username} className="overflow-hidden bg-black/20 backdrop-blur-sm border-white/20">
                    <CardContent className="p-3 flex flex-col items-center justify-center gap-2 text-center">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                        <AvatarImage src={user.photoURL} alt={user.username} />
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
}