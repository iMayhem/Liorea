"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import UserAvatar from '../UserAvatar';

export default function ChatPanel() {
  const { messages, sendMessage, sendTypingEvent, typingUsers } = useChat();
  const { username } = usePresence();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
      sendTypingEvent();
  };

  useEffect(() => {
    if (messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length]);

  const getTypingMessage = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return 'Several people are typing...';
  };

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white flex flex-col h-[480px] w-full shadow-xl">
      <CardHeader className="p-4 border-b border-white/20 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Group Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full pr-4" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.username === username;
              return (
                <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                   {!isCurrentUser && (
                     <UserAvatar 
                        username={msg.username} 
                        fallbackUrl={msg.photoURL} // Pass chat-specific backup
                        className="w-8 h-8 shrink-0" 
                     />
                   )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                     <div className={`rounded-lg px-3 py-2 max-w-[240px] break-words ${isCurrentUser ? 'bg-primary/80 text-primary-foreground' : 'bg-black/30'}`}>
                        {!isCurrentUser && <p className="text-xs font-bold text-accent mb-1">{msg.username}</p>}
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                     </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        
        {typingUsers.length > 0 && (
            <div className="absolute bottom-2 left-4 text-xs text-muted-foreground italic animate-pulse bg-black/40 px-2 py-1 rounded">
                {getTypingMessage()}
            </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-white/20 shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            className="bg-black/30 border-white/30 focus-visible:ring-accent placeholder:text-white/60"
            value={newMessage}
            onChange={handleInputChange}
          />
          <Button type="submit" size="icon" variant="primary" className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}