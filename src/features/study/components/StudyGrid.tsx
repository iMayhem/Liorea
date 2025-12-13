
import { Clock, Users } from 'lucide-react';
import { StudyUser } from '../context/PresenceContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from '@/components/UserAvatar';
import { StudyUserCard } from './StudyUserCard';

interface StudyGridProps {
  users: StudyUser[];
}

const formatTime = (seconds: number = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function StudyGrid({ users }: StudyGridProps) {
  // Use users directly as they are already sorted by study time in the context
  const sortedUsers = users;

  return (
    <div className="w-full h-full p-0">
      {/* Header Removed as requested */}

      <ScrollArea className="h-full pr-4">
        {/* Adjusted Grid for 35% Container Width */}
        {/* Force 3 columns using inline styles to guarantee layout even if Tailwind classes conflict */}
        <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {sortedUsers.map((user) => (
            <StudyUserCard key={user.username} user={user} formatTime={formatTime} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}