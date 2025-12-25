"use client";

import React, { useState, useEffect } from 'react';
import { Smile, Trash2, Reply, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageActionsProps {
    isCurrentUser: boolean;
    isModerator: boolean;
    onReact: (emoji: string) => void;
    onReply: () => void;
    onDelete: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Default frequently used emojis
const DEFAULT_FREQUENT_EMOJIS = ['👍', '❤️', '😂'];

// Curated selection of most commonly used emojis (~48 total)
const ALL_EMOJIS = [
    // Happy & Positive
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋',

    // Gestures & Reactions
    '👍', '👎', '👏', '🙌', '🙏', '💪', '✌️', '🤝',

    // Sad & Concerned
    '😢', '😭', '😔', '😕', '🥺', '😰', '😱', '😨',

    // Other Emotions
    '😮', '😲', '🤔', '😴', '🥱', '😡', '😠', '🤬',

    // Hearts & Love
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💕', '💖', '💗', '💝', '💔',

    // Popular Symbols
    '✨', '⭐', '🔥', '💯', '✅', '❌', '⚡', '💡',
    '🎉', '🎊', '🎁', '🏆', '🚀', '💰', '🌈', '☀️'
];

export const MessageActions: React.FC<MessageActionsProps> = ({
    isCurrentUser,
    isModerator,
    onReact,
    onReply,
    onDelete,
    isOpen,
    onOpenChange
}) => {
    const [frequentEmojis, setFrequentEmojis] = useState<string[]>(DEFAULT_FREQUENT_EMOJIS);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Load frequently used emojis from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('frequent-emojis');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setFrequentEmojis(parsed.slice(0, 3));
                }
            } catch (e) {
                console.error('Failed to parse frequent emojis:', e);
            }
        }
    }, []);

    const handleEmojiClick = (emoji: string) => {
        onReact(emoji);
        onOpenChange(false);
        setShowEmojiPicker(false);

        // Update frequency tracking
        const usage = JSON.parse(localStorage.getItem('emoji-usage') || '{}');
        usage[emoji] = (usage[emoji] || 0) + 1;
        localStorage.setItem('emoji-usage', JSON.stringify(usage));

        // Update frequent emojis (top 3)
        const sorted = Object.entries(usage)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 3)
            .map(([emoji]) => emoji);

        if (sorted.length > 0) {
            setFrequentEmojis(sorted);
            localStorage.setItem('frequent-emojis', JSON.stringify(sorted));
        }
    };

    return (
        <div className="absolute right-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -translate-y-1/2 z-10">
            {/* Quick Reactions */}
            <Popover open={isOpen} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <button className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        <Smile className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align="end"
                    className="w-auto p-2 bg-[#18181b] border border-white/10 shadow-2xl backdrop-blur-md"
                    sideOffset={5}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col gap-2">
                        {/* Frequently Used */}
                        <div className="flex gap-1">
                            {frequentEmojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl hover:scale-125 transition-transform p-1 hover:bg-white/10 rounded"
                                >
                                    {emoji}
                                </button>
                            ))}

                            {/* More Emojis Button */}
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white border border-white/10"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* All Emojis Picker */}
                        {showEmojiPicker && (
                            <div className="grid grid-cols-8 gap-1 pt-2 border-t border-white/10 max-w-[280px]">
                                {ALL_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-xl hover:scale-125 transition-transform p-1 hover:bg-white/10 rounded"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Reply */}
            <button
                onClick={onReply}
                className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
                <Reply className="w-4 h-4" />
            </button>

            {/* Delete (only for own messages or moderators) */}
            {(isCurrentUser || isModerator) && (
                <button
                    onClick={onDelete}
                    className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
