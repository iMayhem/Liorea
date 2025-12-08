"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ChatPanel() {
  const { messages, sendMessage } = useChat();
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

  useEffect(() => {
    if (scrollAreaRef.current) {
       const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
       if (viewport) {
         viewport.scrollTop = viewport.scrollHeight;
       }
    }
  }, [messages]);


  return (
    <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white flex flex-col h-[70vh] max-h-[600px]">
      <CardHeader className="p-4 border-b border-white/20">
        <CardTitle className="text-base">Study Room Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => {
               const avatarUrl = PlaceHolderImages[msg.username.charCodeAt(0) % PlaceHolderImages.length]?.imageUrl || '';
              const isCurrentUser = msg.username === username;
              return (
                <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                   {!isCurrentUser && (
                     <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src={avatarUrl} alt={msg.username} data-ai-hint="person portrait" />
                        <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                   )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                     <div className={`rounded-lg px-3 py-2 max-w-xs ${isCurrentUser ? 'bg-primary/80 text-primary-foreground' : 'bg-white/20'}`}>
                        {!isCurrentUser && <p className="text-xs font-bold text-accent mb-1">{msg.username}</p>}
                        <p className="text-sm">{msg.message}</p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t border-white/20">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="bg-transparent border-white/30 focus-visible:ring-accent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" variant="secondary" className="bg-accent/80 hover:bg-accent text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
