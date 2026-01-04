import React, { useState } from 'react';
import { StudyUser } from '../context/PresenceContext';
import UserAvatar from '@/components/UserAvatar';
import { Clock, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyUserCardProps {
    user: StudyUser;
    formatTime: (seconds: number) => string;
}

export const StudyUserCard = React.memo(function StudyUserCard({ user, formatTime }: StudyUserCardProps) {
    return (
        <div className="relative group cursor-pointer h-40 bg-card hover:bg-accent/50 transition-all rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 border border-border">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            {/* Focus Mode Badge */}
            {user.is_focus_mode && (
                <div className="absolute top-2 right-2 z-30 bg-purple-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <EyeOff className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-bold text-white">Focus</span>
                </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3">
                <UserAvatar
                    username={user.username}
                    className={cn(
                        "w-16 h-16 mb-2 border-2 border-border shadow-md transition-all duration-500 group-hover:scale-105",
                        user.is_focus_mode && "focus-glow"
                    )}
                />

                {/* Name & Time */}
                <div className="flex flex-col items-center w-full">
                    <p className="font-bold text-foreground truncate w-full text-center mb-1 text-sm group-hover:text-primary transition-colors">{user.username}</p>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(user.total_study_time)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.user.username === next.user.username &&
        prev.user.total_study_time === next.user.total_study_time &&
        prev.user.photoURL === next.user.photoURL &&
        prev.user.equipped_frame === next.user.equipped_frame &&
        prev.user.is_focus_mode === next.user.is_focus_mode
    );
});
