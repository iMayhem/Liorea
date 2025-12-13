import React from 'react';
import { StudyUser } from '../context/PresenceContext';
import UserAvatar from '@/components/UserAvatar';
import { Clock } from 'lucide-react';

interface StudyUserCardProps {
    user: StudyUser;
    formatTime: (seconds: number) => string;
}

export const StudyUserCard = React.memo(function StudyUserCard({ user, formatTime }: StudyUserCardProps) {
    return (
        <div className="relative group cursor-pointer h-40 bg-card hover:bg-accent/50 transition-all rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 border border-border">
            {/* Decorative Background */}
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
}, (prev, next) => {
    // Custom comparison to ensure strict equality updates only
    return (
        prev.user.username === next.user.username &&
        prev.user.total_study_time === next.user.total_study_time &&
        prev.user.photoURL === next.user.photoURL &&
        prev.user.equipped_frame === next.user.equipped_frame
    );
});
