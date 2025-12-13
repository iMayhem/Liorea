
import { Clock, Users } from 'lucide-react';
import { StudyUser } from '../context/PresenceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from '@/components/UserAvatar';

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
    <div className="w-full h-full p-0">
      {/* Header Removed as requested */}

      <ScrollArea className="h-full pr-4">
        {/* Adjusted Grid for 35% Container Width */}
        {/* Force 3 columns using inline styles to guarantee layout even if Tailwind classes conflict */}
        <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {sortedUsers.map((user) => {
            return (
              <div key={user.username} className="relative group cursor-pointer h-40 bg-card hover:bg-accent/50 transition-all rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 border border-border">
                {/* Decorative Background like Journal */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3">
                  <UserAvatar username={user.username} className="w-16 h-16 mb-2 border-2 border-border shadow-md transition-transform group-hover:scale-105" />
                  <p className="font-bold text-foreground truncate w-full text-center mb-1 text-sm group-hover:text-primary transition-colors">{user.username}</p>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(user.total_study_time)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}