import { useFocus } from '@/context/FocusContext';
import { cn } from '@/lib/utils';
import { X, EyeOff, Users, Clock, Flame } from 'lucide-react';
import { usePresence } from '@/features/study';
import UserAvatar from '@/components/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface FocusEvent {
  id: string;
  username: string;
  type: 'join' | 'leave';
  timestamp: number;
}

export default function FocusOverlay() {
  const { isFocusMode, toggleFocusMode } = useFocus();
  const { communityUsers, username: myUsername } = usePresence();

  // Filter for people in focus mode
  const focusUsers = communityUsers.filter(u => u.is_focus_mode);

  // Track joins/leaves for activity log
  const [events, setEvents] = useState<FocusEvent[]>([]);
  const prevFocusUsersRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isFocusMode) return;

    const currentFocusUsernames = focusUsers.map(u => u.username);
    const prevFocusUsernames = prevFocusUsersRef.current;

    // Joins
    currentFocusUsernames.forEach(name => {
      if (!prevFocusUsernames.includes(name) && name !== myUsername) {
        const newEvent: FocusEvent = {
          id: `${Date.now()}-${name}`,
          username: name,
          type: 'join',
          timestamp: Date.now()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 5));
      }
    });

    // Leaves
    prevFocusUsernames.forEach(name => {
      if (!currentFocusUsernames.includes(name) && name !== myUsername) {
        const newEvent: FocusEvent = {
          id: `${Date.now()}-${name}`,
          username: name,
          type: 'leave',
          timestamp: Date.now()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 5));
      }
    });

    prevFocusUsersRef.current = currentFocusUsernames;
  }, [focusUsers, isFocusMode, myUsername]);

  return (
    <AnimatePresence>
      {isFocusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={toggleFocusMode}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full group"
            aria-label="Exit focus mode"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <EyeOff className="w-8 h-8 text-purple-400 animate-pulse" />
              <h1 className="text-4xl font-bold text-white tracking-tight">Focus Chamber</h1>
            </div>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              You are in deep focus. Distractions are hidden. You are not alone in the grind.
            </p>
          </motion.div>

          {/* Main Grid: Active Focusers */}
          <div className="w-full max-w-6xl overflow-y-auto custom-scrollbar px-4 flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
              <AnimatePresence mode="popLayout">
                {focusUsers.map((user) => (
                  <motion.div
                    key={user.username}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full"
                  >
                    <div className="relative">
                      <UserAvatar
                        username={user.username}
                        className="w-20 h-20 border-2 border-purple-500/50 focus-glow"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 border-2 border-black">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white truncate max-w-[100px]">
                        {user.username === myUsername ? "You" : user.username}
                      </p>
                      <span className="text-[10px] text-purple-400 font-mono tracking-wider uppercase">Focusing</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {focusUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p>Seems quiet here... start the grind!</p>
              </div>
            )}
          </div>

          {/* Bottom Bar: Live Activity Log */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 w-full max-w-md bg-white/5 border border-white/5 rounded-2xl p-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recent Activity</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {events.length > 0 ? events.map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0"
                  >
                    <span className="text-white/70 font-medium">{event.username}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded flex items-center gap-1",
                      event.type === 'join' ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                      {event.type === 'join' ? "Entered Chamber" : "Left Chamber"}
                    </span>
                  </motion.div>
                )) : (
                  <p className="text-[10px] text-white/20 text-center py-2 italic font-mono">No recent activity</p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
