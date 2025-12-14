"use client";

import React from 'react';
import { Smile, Trash2, Flag, Reply } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const QUICK_EMOJIS = ["🔥", "❤️", "👍", "😂", "😮", "😢", "🎉", "💯"];

interface MessageActionsProps {
    isCurrentUser: boolean;
    isModerator?: boolean;
    onReact: (emoji: string) => void;
    onReply: () => void;
    onDelete?: () => void;
    onReport?: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
    isCurrentUser,
    isModerator = false,
    onReact,
    onReply,
    onDelete,
    onReport,
    isOpen,
    onOpenChange
}) => {
    return (
        <div className="absolute right-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -translate-y-1/2 z-10">
            <Popover open={isOpen} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <button className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        <Smile className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1.5 bg-[#18181b] border border-white/10 rounded-full shadow-2xl backdrop-blur-md" side="top" sideOffset={5}>
                    <div className="flex gap-1.5">
                        {QUICK_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                className="p-1.5 hover:bg-white/10 rounded-full text-lg transition-colors"
                                onClick={() => { onReact(emoji); onOpenChange(false); }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            <button
                onClick={onReply}
                className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
                <Reply className="w-4 h-4" />
            </button>

            {(isCurrentUser || isModerator) && onDelete && (
                <button
                    onClick={onDelete}
                    className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {!isCurrentUser && onReport && onDelete && (
                <button
                    onClick={onDelete}
                    className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {!isCurrentUser && onReport && (
                <button
                    onClick={onReport}
                    className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                    <Flag className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
