// src/components/group-chat.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, CornerDownLeft, X, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useStudyRoom } from '@/hooks/use-study-room';


interface GroupChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: { text: string; }, replyTo: { id: string, text: string } | null) => void;
  currentUserId: string;
  onTyping: (isTyping: boolean) => void;
  typingUsers: { [uid: string]: string };
}

export function GroupChat({ messages: initialMessages, onSendMessage, currentUserId, onTyping, typingUsers }: GroupChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<{id: string, text: string} | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = React.useRef(initialMessages.length);
  const { profile } = useAuth();


  React.useEffect(() => {
    // Sync with external messages, but prioritize local state for smooth updates
    setMessages(initialMessages);

    // Check for new incoming messages to play notification sound
    if (initialMessages.length > prevMessagesLengthRef.current) {
        const lastMessage = initialMessages[initialMessages.length - 1];
        // Play sound only for incoming messages, not for messages sent by the current user
        if (lastMessage && lastMessage.senderId !== currentUserId) {
            const notificationSound = document.getElementById('chat-notification-sound') as HTMLAudioElement;
            if (notificationSound) {
                notificationSound.play().catch(error => console.error("Error playing notification sound:", error));
            }
        }
    }
    
    prevMessagesLengthRef.current = initialMessages.length;

  }, [initialMessages, currentUserId]);

  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);
  
  const debouncedStopTyping = React.useCallback(useDebouncedCallback(
    () => {
      onTyping(false);
    },
    2000, // 2 second delay after user stops typing
  ), [onTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    if (text) {
        onTyping(true);
        debouncedStopTyping();
    } else {
        onTyping(false);
        debouncedStopTyping.cancel();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.username) return;

    if (newMessage.trim()) {
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        text: newMessage.trim(),
        senderId: currentUserId,
        senderName: profile.username, 
        timestamp: new Date(),
        ...(replyTo && { replyToId: replyTo.id, replyToText: replyTo.text }),
      };

      // Optimistic UI update
      setMessages(prev => [...prev, optimisticMessage]);
      onSendMessage({ text: newMessage.trim() }, replyTo);
      debouncedStopTyping.cancel();
      onTyping(false); // Immediately clear typing indicator on send
      setNewMessage('');
      setReplyTo(null);
    }
  };

  const handleReplyClick = (message: ChatMessage) => {
    setReplyTo({id: message.id, text: message.text || 'Message'});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);
  
  const activeTypers = React.useMemo(() => 
    Object.entries(typingUsers)
    .filter(([uid]) => uid !== currentUserId)
    .map(([, username]) => username),
  [typingUsers, currentUserId]);


  return (
    <Card className="h-full flex flex-col bg-background/80">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5"/>
            Group Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="pr-4 space-y-4">
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUserId;
                const originalMessage = msg.replyToId ? findMessageById(msg.replyToId) : null;
                return (
                <div
                    key={msg.id}
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
                        
                        {msg.text && <p className="text-sm">{msg.text}</p>}

                        <div className="absolute top-0 flex gap-1 p-1 rounded-full bg-background/20 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={isCurrentUser ? {left: '-8px'} : {right: '-8px'}}>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleReplyClick(msg)}><CornerDownLeft className="h-4 w-4"/></Button>
                        </div>
                        
                    </div>
                </div>
                )
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 pt-2 flex-col items-start gap-1">
         <div className="h-6 text-sm text-muted-foreground italic w-full overflow-hidden">
             {activeTypers.length > 0 && (
                <p className="truncate">
                    {activeTypers.join(', ')} {activeTypers.length === 1 ? 'is' : 'are'} typing...
                </p>
            )}
        </div>
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
            onChange={handleInputChange}
            placeholder={"Type your message..."}
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
