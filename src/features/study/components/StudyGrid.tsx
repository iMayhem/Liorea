
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
      <ScrollArea className="h-full pr-4">
        {/* Adjusted Grid for 35% Container Width - 3 Columns */}
        <div className="grid gap-4 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {sortedUsers.map((user) => {
            return (
              <div key={user.username} className="relative group cursor-pointer flex flex-col items-center p-4 rounded-2xl bg-[#1e2024]/80 backdrop-blur-sm border border-white/5 hover:border-indigo-500/30 hover:bg-[#25282e] transition-all duration-300 shadow-lg group">

                {/* Circular Clock Avatar Container */}
                <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                  {/* Decorative Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/5 group-hover:border-indigo-500/30 transition-colors duration-500 spin-slow-decorative" />

                  {/* "Clock" Progress Ring (Static Aesthetic for now) */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                    <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * 0.25} className="text-indigo-500/50 group-hover:text-indigo-400 transition-colors blur-[1px]" strokeLinecap="round" />
                  </svg>

                  {/* Avatar */}
                  <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-[#121212] group-hover:scale-105 transition-transform duration-300">
                    <UserAvatar username={user.username} className="w-full h-full" />
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center w-full z-10">
                  <p className="font-bold text-zinc-100 truncate text-sm mb-1 group-hover:text-indigo-300 transition-colors">{user.username}</p>

                  {/* Time Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs font-medium text-zinc-300 tabular-nums">{formatTime(user.total_study_time)}</span>
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