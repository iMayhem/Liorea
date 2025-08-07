// src/components/group-chat.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, CornerDownLeft, X, SmilePlus } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


interface GroupChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, replyTo: { id: string; text: string } | null) => void;
  currentUserId: string;
  onReaction: (messageId: string, emoji: string) => void;
}

const EMOJIS = ['👍', '😂', '❤️', '🤔', '🎉', '✨', '😢', '🔥', '🌧️', '❄️', '🤯', '🙏'];
const ANIMATION_MAP: Record<string, string> = {
    '🌧️': 'rain', '😢': 'rain', '😭': 'rain',
    '🔥': 'fire', '❤️‍🔥': 'fire', '🥵': 'fire',
    '❄️': 'snow', '🥶': 'snow', '☃️': 'snow',
    '🎉': 'confetti', '🥳': 'confetti', '🎊': 'confetti',
    '✨': 'stars', '⭐': 'stars', '🌟': 'stars',
};

export function GroupChat({ messages, onSendMessage, currentUserId, onReaction }: GroupChatProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<{id: string, text: string} | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), replyTo);
      setNewMessage('');
      setReplyTo(null);
    }
  };

  const handleReplyClick = (message: ChatMessage) => {
    setReplyTo({id: message.id, text: message.text});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5"/>
            Group Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="pr-4 space-y-4">
             <AnimatePresence>
                {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    const originalMessage = msg.replyToId ? findMessageById(msg.replyToId) : null;
                    return (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            'flex flex-col gap-1 group',
                            isCurrentUser ? 'items-end' : 'items-start'
                        )}
                    >
                        <div
                            className={cn(
                            'rounded-lg px-3 py-2 max-w-xs break-words relative',
                            isCurrentUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            <p className="text-xs font-semibold text-muted-foreground/80 mb-0.5">
                                {isCurrentUser ? 'You' : msg.senderName}
                            </p>
                            
                            {originalMessage && (
                                <div className="border-l-2 border-blue-300 pl-2 text-xs opacity-80 mb-1">
                                    <p className="font-bold">{originalMessage.senderName}</p>
                                    <p className="truncate">{originalMessage.text}</p>
                                </div>
                            )}

                            <p className="text-sm">{msg.text}</p>

                            <div className="absolute top-0 flex gap-1 p-1 rounded-full bg-background/20 backdrop-blur-sm -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={isCurrentUser ? {left: '-8px'} : {right: '-8px'}}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6"><SmilePlus className="h-4 w-4"/></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1">
                                        <div className="grid grid-cols-6 gap-1">
                                            {EMOJIS.map(emoji => (
                                                <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 text-lg" onClick={() => onReaction(msg.id, emoji)}>{emoji}</Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleReplyClick(msg)}><CornerDownLeft className="h-4 w-4"/></Button>
                            </div>
                            
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {Object.entries(msg.reactions).map(([emoji, users]) => users.length > 0 && (
                                        <div key={emoji} className={cn("px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 cursor-pointer", users.includes(currentUserId) ? 'bg-blue-500/50' : 'bg-muted/50')} onClick={() => onReaction(msg.id, emoji)}>
                                            <span>{emoji}</span>
                                            <span>{users.length}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                    )
                })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 pt-4 flex-col items-start gap-2">
         {replyTo && (
            <div className="text-xs p-2 rounded-md bg-muted w-full flex justify-between items-center">
                <div>
                    <p className="font-bold">Replying to a message</p>
                    <p className="truncate max-w-xs text-muted-foreground">{replyTo.text}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}><X className="h-4 w-4"/></Button>
            </div>
         )}
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
