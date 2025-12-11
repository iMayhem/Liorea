"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import EmojiReactionPicker from './EmojiReactionPicker';
import { Flag, Trash2 } from 'lucide-react';

// --- TYPES ---
export interface MessageData {
  id: string | number;
  username: string;
  message?: string;    // Chat uses 'message'
  content?: string;    // Journal uses 'content'
  image_url?: string;
  photoURL?: string;
  timestamp: number;   // or created_at
  reactions?: Record<string, any> | any[]; // Handle both Firebase object and D1 array
}

interface MessageBubbleProps {
  message: MessageData;
  isCurrentUser: boolean;
  showHeader?: boolean; // Show avatar/name? (False if same user sent previous msg)
  
  // Actions
  onReact: (emoji: string) => void;
  onReport?: () => void;
  onDelete?: () => void;
}

// --- HELPER: Highlight @Mentions ---
const FormattedContent = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-medium cursor-pointer hover:bg-indigo-500/50 transition-colors select-none mx-0.5">
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default function MessageBubble({ 
  message, 
  isCurrentUser, 
  showHeader = true, 
  onReact, 
  onReport,
  onDelete
}: MessageBubbleProps) {
  
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);

  // Normalize data fields (handle differences between Chat and Journal data)
  const textContent = message.message || message.content || "";
  const dateObj = new Date(message.timestamp);
  
  // Logic to group reactions (Counts + "Did I react?")
  const reactionGroups = (() => {
    const groups: Record<string, { count: number, hasReacted: boolean }> = {};
    const reactions = message.reactions || {};
    
    // Handle both Array (Journal) and Object (Firebase) structures
    const list = Array.isArray(reactions) ? reactions : Object.values(reactions);

    list.forEach((r: any) => {
        if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false };
        groups[r.emoji].count++;
        // We can't easily check "hasReacted" without passing current username in props,
        // but for visual simplicity we just show counts or highlighted style if we had the data.
    });
    return groups;
  })();

  return (
    <div 
      className={cn(
        "group relative flex gap-4 pr-2 hover:bg-white/[0.04] -mx-4 px-4 transition-colors", 
        showHeader ? "mt-6" : "mt-0.5 py-0.5"
      )}
    >
      {/* 1. LEFT COLUMN: Avatar or Timestamp */}
      <div className="w-10 shrink-0 select-none pt-0.5">
        {showHeader ? (
           <UserAvatar 
             username={message.username} 
             fallbackUrl={message.photoURL} 
             className="w-10 h-10 hover:opacity-90 cursor-pointer" 
           />
        ) : (
           <div className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 text-right w-full pr-2 pt-1 select-none">
               {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
           </div>
        )}
      </div>

      {/* 2. RIGHT COLUMN: Content */}
      <div className="flex-1 min-w-0">
        
        {/* Header (Name + Date) */}
        {showHeader && (
            <div className="flex items-center gap-2 mb-1 select-none">
                <span className="text-base font-semibold text-white hover:underline cursor-pointer">
                    {message.username}
                </span>
                <span className="text-xs text-white/30 ml-1">
                    {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        )}

        {/* The Actual Message */}
        <div className="text-base text-zinc-100 leading-[1.375rem] whitespace-pre-wrap break-words font-light tracking-wide">
            {message.image_url ? (
                <img 
                    src={message.image_url} 
                    alt="Attachment" 
                    className="max-w-[250px] rounded-lg mt-1 border border-white/10" 
                    loading="lazy" 
                />
            ) : (
                <FormattedContent text={textContent} />
            )}
        </div>

        {/* Reaction Chips (Existing Reactions) */}
        {Object.keys(reactionGroups).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 select-none">
                {Object.entries(reactionGroups).map(([emoji, data]) => (
                    <button 
                        key={emoji} 
                        onClick={() => onReact(emoji)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border border-transparent bg-[#2b2d31] hover:border-white/20 transition-colors"
                    >
                        <span className="text-base">{emoji}</span>
                        <span className="text-xs font-bold text-zinc-300">{data.count}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* 3. HOVER ACTIONS (Floating Menu) */}
      <div 
        className={cn(
            "absolute right-4 -top-2 bg-[#111113] shadow-sm rounded-[4px] border border-white/5 flex items-center p-0.5 z-10 transition-opacity",
            (isReactionMenuOpen) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {/* Emoji Picker */}
        <EmojiReactionPicker 
            isOpen={isReactionMenuOpen}
            onOpenChange={setIsReactionMenuOpen}
            onReact={onReact}
        />

        {/* Delete (Owner) */}
        {isCurrentUser && onDelete && (
            <button 
                onClick={onDelete} 
                className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400 transition-colors"
                title="Delete Message"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        )}

        {/* Report (Non-Owner) */}
        {!isCurrentUser && onReport && (
            <button 
                onClick={onReport} 
                className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400 transition-colors" 
                title="Report"
            >
                <Flag className="w-4 h-4" />
            </button>
        )}
      </div>

    </div>
  );
}