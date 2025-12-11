import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Clock, Users } from 'lucide-react';
import { StudyUser } from '@/shared/context/PresenceContext';
import { ScrollArea } from '@/shared/ui/scroll-area';
import UserAvatar from '@/shared/components/UserAvatar';

interface StudyGridProps {
  users: StudyUser[];
}

const formatTime = (seconds: number = 0) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export default function StudyGrid({ users }: StudyGridProps) {
  const sortedUsers = [...users].sort((a, b) => a.username.localeCompare(b.username));
  
  return (
    // UPDATED CLASSNAME:
    <Card className="glass-panel text-white w-full h-[480px] rounded-2xl overflow-hidden">
        <CardHeader className="p-4 glass-panel-light">
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
                <Card key={user.username} className="overflow-hidden bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm border-white/5">
                    <CardContent className="p-3 flex flex-col items-center justify-center gap-2 text-center">
                    <UserAvatar username={user.username} className="w-16 h-16 border-2 border-white/10" />
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