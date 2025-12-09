"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import { Avatar, AvatarFallback } from '../ui/avatar';

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

export default function ChatPanel() {
  const { messages, sendMessage, sendTypingEvent, typingUsers } = useChat();
  const { username } = usePresence();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  const getUserColor = (username: string) => {
    const charCodeSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return USER_COLORS[charCodeSum % USER_COLORS.length];
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
      sendTypingEvent();
  };

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
      
      {/* 
         CRITICAL FIX: 
         flex-1: Takes up remaining space.
         min-h-0: Prevents the container from expanding beyond the parent's height limit.
         This forces the ScrollArea to actually scroll instead of stretching the card.
      */}
      <CardContent className="p-0 flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full pr-4" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.username === username;
              return (
                <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                   {!isCurrentUser && (
                     <Avatar className="w-8 h-8 border-2 border-primary shrink-0">
                        <AvatarFallback className={`${getUserColor(msg.username)} text-white`}>{msg.username.charAt(0)}</AvatarFallback>
                    </Avatar>
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
          <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 text-white flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
