// src/components/group-chat.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface GroupChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

export function GroupChat({ messages, onSendMessage, currentUserId }: GroupChatProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5"/>
            Group Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full" ref={scrollAreaRef} viewportRef={viewportRef}>
          <div className="pr-4 space-y-4">
             <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            'flex flex-col gap-1',
                            msg.senderId === currentUserId ? 'items-end' : 'items-start'
                        )}
                    >
                        <div
                            className={cn(
                            'rounded-lg px-3 py-2 max-w-xs break-words',
                            msg.senderId === currentUserId
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            <p className="text-xs font-semibold text-muted-foreground/80 mb-0.5">
                                {msg.senderId === currentUserId ? 'You' : msg.senderName}
                            </p>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 pt-4">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Input
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
