"use client";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

// Centralized list of reactions
export const QUICK_EMOJIS = ["🔥", "❤️", "👍", "😂", "😮", "😢", "🎉", "💯"];

interface EmojiReactionPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReact: (emoji: string) => void;
  className?: string; // To allow custom positioning or styling if needed
}

export default function EmojiReactionPicker({ 
  isOpen, 
  onOpenChange, 
  onReact,
  className 
}: EmojiReactionPickerProps) {
  
  const handleReact = (emoji: string) => {
    onReact(emoji);
    onOpenChange(false); // Close after picking
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors", 
            className
          )}
        >
          <Smile className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-1.5 bg-[#18181b] border border-white/10 rounded-lg shadow-xl backdrop-blur-xl" 
        side="top" 
        align="end" 
        sideOffset={5}
      >
        <div className="flex gap-1">
          {QUICK_EMOJIS.map(emoji => (
            <button 
              key={emoji} 
              className="p-2 hover:bg-white/10 rounded-md text-xl transition-colors active:scale-90 transform" 
              onClick={() => handleReact(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}