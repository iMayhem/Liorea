import React, { useState } from 'react';
import { StudyUser } from '../context/PresenceContext';
import { useScreenShare } from '../context/ScreenShareContext';
import UserAvatar from '@/components/UserAvatar';
import { Clock, Play, EyeOff } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ExpandedScreenShareModal } from './ExpandedScreenShareModal';

interface StudyUserCardProps {
    user: StudyUser;
    formatTime: (seconds: number) => string;
}

export const StudyUserCard = React.memo(function StudyUserCard({ user, formatTime }: StudyUserCardProps) {
    const { hostUsername, remoteStream, toggleHiddenStream, localStream, startSharing, stopSharing, isSharing } = useScreenShare();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Is this card representing the HOST?
    const isHost = hostUsername === user.username;
    // Do we have a video stream to show?
    // If I am the host, show my LOCAL stream.
    // If I am a viewer and this is the host, show REMOTE stream.
    const showVideo = isHost && ((user.username === hostUsername && remoteStream) || (isSharing && localStream && user.username === hostUsername)); // Use simplified logic

    // Actually, local user card logic:
    // If `isSharing` is true, MY card should show `localStream`.
    // If `!isSharing` and `isHost` is true, THIS card (if it matches host) should show `remoteStream`.

    // Better:
    // 1. Am I the user on this card?
    //    If yes, and I am sharing -> Show Local Stream.
    // 2. Is this card the Host?
    //    If yes, and I am NOT the host -> Show Remote Stream.

    // Using `hostUsername` from context is reliable.
    // If `user.username === hostUsername`...

    let videoStream: MediaStream | null = null;
    let isLive = false;

    if (isSharing && localStream && isHost /* I am host */) {
        videoStream = localStream;
        isLive = true;
    } else if (remoteStream && isHost /* This card is host */) {
        videoStream = remoteStream;
        isLive = true;
    }

    const handleStopSeeing = () => {
        toggleHiddenStream(user.username);
    };

    const handleCardClick = () => {
        if (isLive) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        onClick={handleCardClick}
                        className={`relative group cursor-pointer h-40 bg-card hover:bg-accent/50 transition-all rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 border border-border ${isLive ? 'ring-2 ring-red-500/50' : ''}`}
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                        {/* Content */}
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3">
                            {isLive && videoStream ? (
                                <div className="absolute inset-0 bg-black flex items-center justify-center">
                                    <video
                                        autoPlay
                                        playsInline
                                        muted
                                        ref={ref => { if (ref) ref.srcObject = videoStream; }}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow animate-pulse">
                                        LIVE
                                    </div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full text-white text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-2 h-2 fill-current" /> Expand
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <UserAvatar username={user.username} className="w-16 h-16 mb-2 border-2 border-border shadow-md transition-transform group-hover:scale-105" />
                                </>
                            )}

                            {/* Always show Name/Time overlay on hover or if not live */}
                            <div className={`${isLive ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity flex flex-col items-center absolute bottom-3 z-30 w-full`}>
                                <p className={`font-bold text-foreground truncate w-full text-center mb-1 text-sm ${isLive ? 'bg-black/50 px-2 rounded' : ''} group-hover:text-primary transition-colors`}>{user.username}</p>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(user.total_study_time)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ContextMenuTrigger>
                {isLive && !isSharing && (
                    <ContextMenuContent>
                        <ContextMenuItem onClick={handleStopSeeing} className="text-red-500 focus:text-red-500">
                            <EyeOff className="w-4 h-4 mr-2" />
                            Stop seeing screen
                        </ContextMenuItem>
                    </ContextMenuContent>
                )}
            </ContextMenu>

            <ExpandedScreenShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                stream={videoStream}
                username={user.username}
                onStopViewing={() => {
                    handleStopSeeing();
                    setIsModalOpen(false);
                }}
            />
        </>
    );
}, (prev, next) => {
    // We need to re-render if host status changes, so strict equality on user object might block it.
    // But `useScreenShare` hook usage inside component will trigger re-renders even if props don't change, 
    // IF the component is safe.
    // `React.memo` only checks PROPS.
    // If context changes, it WILL re-render.
    // So the memo check is fine for `user` prop changes.
    return (
        prev.user.username === next.user.username &&
        prev.user.total_study_time === next.user.total_study_time &&
        prev.user.photoURL === next.user.photoURL &&
        prev.user.equipped_frame === next.user.equipped_frame
    );
});
