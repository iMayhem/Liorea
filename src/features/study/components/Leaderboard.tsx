import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Trophy, TrendingUp, TrendingDown, Minus, Calendar, Filter, ChevronDown } from 'lucide-react';
import { StudyUser } from '@/features/study';
import UserAvatar from '@/components/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeaderboardProps {
  users: StudyUser[];
  currentUsername?: string | null;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function Leaderboard({ users, currentUsername }: LeaderboardProps) {
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'all'>('daily');

  // Filter Logic (Mocked for now as we only have total time)
  // In a real app, you'd filter `users` based on the selected timeframe.
  const displayUsers = users;

  return (
    <Card className="bg-transparent border-none shadow-none text-white w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            Leaderboard
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition-colors">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="capitalize">{filter === 'all' ? 'All Time' : filter}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-zinc-950 border border-white/10 text-white shadow-xl z-[60]">
              <DropdownMenuItem onClick={() => setFilter('daily')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">Daily</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('weekly')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">Weekly</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('all')} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar space-y-2">
        <AnimatePresence mode='popLayout'>
          {displayUsers.map((user, index) => {
            const isMe = currentUsername === user.username;
            const rank = index + 1;

            let rankStyle = "text-zinc-500 font-mono font-bold text-sm bg-zinc-800/50";
            let rowBg = isMe
              ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]"
              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10";

            if (index === 0) {
              rankStyle = "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
              rowBg = isMe
                ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]"
                : "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20";
            } else if (index === 1) {
              rankStyle = "text-slate-300 bg-slate-400/10 border border-slate-400/20";
              rowBg = isMe
                ? "bg-gradient-to-r from-slate-400/20 to-slate-500/10 border-slate-400/50 shadow-[0_0_20px_-5px_rgba(148,163,184,0.3)]"
                : "bg-gradient-to-r from-slate-500/10 to-transparent border-slate-500/20";
            } else if (index === 2) {
              rankStyle = "text-orange-400 bg-orange-400/10 border border-orange-400/20";
              rowBg = isMe
                ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]"
                : "bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20";
            }

            return (
              <motion.div
                key={user.username}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-default relative overflow-hidden group ${rowBg}`}
              >
                {/* Rank */}
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg shadow-inner ${rankStyle}`}>
                  {index < 3 ? <Award className="w-5 h-5" /> : <span>{rank}</span>}
                </div>
                {/* Avatar */}
                <div className="relative shrink-0">
                  <UserAvatar username={user.username} className="w-10 h-10 border border-white/10" />
                  {isMe && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212]" />}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-zinc-200'}`}>
                      {isMe ? 'You' : user.username}
                    </p>
                    {user.status_text && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 truncate max-w-[80px]">
                        {user.status_text}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(user.total_study_time || 0)}</span>
                  </div>
                </div>

                {/* Trend */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {user.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {user.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {(!user.trend || user.trend === 'same') && <Minus className="w-4 h-4 text-zinc-600" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/30 space-y-3">
            <Trophy className="w-10 h-10 opacity-20" />
            <p className="text-sm">No rankings yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}