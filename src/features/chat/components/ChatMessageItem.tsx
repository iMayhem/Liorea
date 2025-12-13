import React from 'react';
import { ChatMessage } from '@/features/chat/context/ChatContext';
import { FormattedMessage } from '@/components/chat/FormattedMessage';
import { MessageActions } from '@/components/chat/MessageActions';
import UserAvatar from '@/components/UserAvatar';

interface ChatMessageItemProps {
    msg: ChatMessage;
    isSequence: boolean;
    showHeader: boolean;
    isCurrentUser: boolean;
    reactionGroups: Record<string, { count: number, hasReacted: boolean }>;
    openReactionPopoverId: string | null;
    onReact: (id: string, emoji: string) => void;
    onReport: (msg: ChatMessage) => void;
    onOpenChange: (open: boolean) => void;
    formatDate: (ts: number) => string;
    formatTime: (ts: number) => string;
}

export const ChatMessageItem = React.memo(function ChatMessageItem({
    msg, isSequence, showHeader, isCurrentUser, reactionGroups,
    openReactionPopoverId, onReact, onReport, onOpenChange,
    formatDate, formatTime
}: ChatMessageItemProps) {
    return (
        <div className={`group relative flex gap-4 pr-4 hover:bg-muted/30 -mx-4 px-4 transition-colors ${showHeader ? 'mt-4' : 'mt-0.5 py-0.5'}`}>
            <div className="w-10 shrink-0 select-none pt-0.5">
                {showHeader ? (
                    <UserAvatar username={msg.username} fallbackUrl={msg.photoURL} className="w-10 h-10 hover:opacity-90 cursor-pointer" />
                ) : (
                    <div className="text-[10px] text-muted-foreground/0 opacity-0 group-hover:opacity-100 text-right w-full pr-2 pt-1 select-none">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {showHeader && (
                    <div className="flex items-center gap-2 mb-1 select-none">
                        <span className="text-base font-semibold text-foreground hover:underline cursor-pointer">{msg.username}</span>
                        <span className="text-xs text-muted-foreground ml-1">{formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}</span>
                    </div>
                )}

                <div className="text-base text-foreground/90 leading-[1.375rem] whitespace-pre-wrap break-words font-light tracking-wide">
                    {msg.image_url ? (
                        <img src={msg.image_url} alt="Attachment" className="max-w-[300px] max-h-80 w-auto object-contain rounded-lg mt-1 border border-border" loading="lazy" />
                    ) : (
                        <FormattedMessage content={msg.message} />
                    )}
                </div>

                {Object.keys(reactionGroups).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 select-none">
                        {Object.entries(reactionGroups).map(([emoji, data]) => (
                            <button
                                key={emoji}
                                onClick={() => onReact(msg.id, emoji)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${data.hasReacted ? 'bg-primary/20 border-primary/50 text-primary-foreground' : 'bg-muted/30 border-transparent hover:border-border text-muted-foreground'}`}
                            >
                                <span className="text-base">{emoji}</span>
                                <span className={`text-xs font-bold ${data.hasReacted ? 'text-primary' : 'text-muted-foreground'}`}>{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <MessageActions
                isCurrentUser={isCurrentUser}
                onReact={(emoji) => onReact(msg.id, emoji)}
                onReport={() => onReport(msg)}
                isOpen={openReactionPopoverId === msg.id}
                onOpenChange={onOpenChange}
            />
        </div>
    );
}, (prev, next) => {
    // Optimize: Only re-render if message content, timestamp, or reactions change
    // or if the "sequence/header" logic changes (which depends on neighbors, handled by parent passing different props)
    return (
        prev.msg.id === next.msg.id &&
        prev.msg.message === next.msg.message &&
        JSON.stringify(prev.msg.reactions) === JSON.stringify(next.msg.reactions) &&
        prev.isSequence === next.isSequence && // Check if position in chain changed
        prev.openReactionPopoverId === next.openReactionPopoverId // Check if *this* message's popover state changed
    );
});
