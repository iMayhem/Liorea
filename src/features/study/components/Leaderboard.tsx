import { Award, Clock, Trophy, TrendingUp, TrendingDown, Calendar, Infinity, ChevronDown } from 'lucide-react';
import { StudyUser } from '@/features/study';
import UserAvatar from '@/components/UserAvatar';
import { useMemo, memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LeaderboardTimeframe = 'daily' | 'weekly' | 'alltime';

interface LeaderboardProps {
  users: StudyUser[];
  currentUsername?: string | null;
  timeframe?: LeaderboardTimeframe;
  onTimeframeChange?: (timeframe: LeaderboardTimeframe) => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

// Compact memoized leaderboard item with more spacing
const LeaderboardItem = memo(({
  user,
  index,
  isMe,
  timeframe
}: {
  user: StudyUser;
  index: number;
  isMe: boolean;
  timeframe: LeaderboardTimeframe;
}) => {
  const rank = index + 1;

  const { rankStyle, rowBg } = useMemo(() => {
    let rankStyle = "text-zinc-500 font-mono font-semibold text-xs bg-zinc-800/50";
    let rowBg = isMe
      ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
      : "bg-white/5 border-white/5 hover:bg-white/10";

    if (index === 0) {
      rankStyle = "text-yellow-400 bg-yellow-400/10";
      rowBg = isMe
        ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30"
        : "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/10 hover:bg-yellow-500/5";
    } else if (index === 1) {
      rankStyle = "text-slate-300 bg-slate-400/10";
      rowBg = isMe
        ? "bg-gradient-to-r from-slate-400/20 to-slate-500/10 border-slate-400/30"
        : "bg-gradient-to-r from-slate-500/10 to-transparent border-slate-500/10 hover:bg-slate-500/5";
    } else if (index === 2) {
      rankStyle = "text-orange-400 bg-orange-400/10";
      rowBg = isMe
        ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30"
        : "bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/10 hover:bg-orange-500/5";
    }

    return { rankStyle, rowBg };
  }, [index, isMe]);

  const displayTime = (user as any).total_minutes || (user as any).total_study_time || 0;
  const formattedTime = useMemo(() => formatTime(displayTime), [displayTime]);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${rowBg}`}>
      {/* Rank */}
      <div className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md ${rankStyle}`}>
        {index < 3 ? <Award className="w-4 h-4" /> : <span className="text-xs">{rank}</span>}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <UserAvatar username={user.username} className="w-9 h-9 border border-white/10" />
        {isMe && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#121212]" />}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-sm truncate ${isMe ? 'text-white' : 'text-zinc-200'}`}>
            {isMe ? 'You' : user.username}
          </p>
          {user.status_text && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 truncate max-w-[70px]">
              {user.status_text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Trend */}
      <div className="shrink-0">
        {(user as any).trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
        {(user as any).trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.user.username === nextProps.user.username &&
    prevProps.index === nextProps.index &&
    prevProps.isMe === nextProps.isMe &&
    prevProps.timeframe === nextProps.timeframe &&
    ((prevProps.user as any).total_minutes || (prevProps.user as any).total_study_time) ===
    ((nextProps.user as any).total_minutes || (nextProps.user as any).total_study_time) &&
    (prevProps.user as any).trend === (nextProps.user as any).trend &&
    prevProps.user.status_text === nextProps.user.status_text
  );
});

LeaderboardItem.displayName = 'LeaderboardItem';

export default function Leaderboard({ users, currentUsername, timeframe = 'daily', onTimeframeChange }: LeaderboardProps) {
  // Limit to top 20 users
  const displayUsers = useMemo(() => users.slice(0, 20), [users]);

  const getTimeframeLabel = (tf: LeaderboardTimeframe) => {
    switch (tf) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'alltime': return 'All-Time';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      {/* Compact Dropdown Header */}
      {onTimeframeChange && (
        <div className="pb-4 shrink-0 flex items-center justify-between">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[140px] h-9 bg-white/5 border-white/10 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2b2d31] border-white/10">
              <SelectItem value="daily" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  Daily
                </div>
              </SelectItem>
              <SelectItem value="weekly" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Weekly
                </div>
              </SelectItem>
              <SelectItem value="alltime" className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <Infinity className="w-3.5 h-3.5 text-purple-500" />
                  All-Time
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {timeframe === 'daily' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          )}
        </div>
      )}

      {/* Spacious List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {displayUsers.map((user, index) => (
          <LeaderboardItem
            key={user.username}
            user={user}
            index={index}
            isMe={currentUsername === user.username}
            timeframe={timeframe}
          />
        ))}

        {displayUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/30 space-y-2">
            <Trophy className="w-8 h-8 opacity-20" />
            <p className="text-xs">No rankings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
