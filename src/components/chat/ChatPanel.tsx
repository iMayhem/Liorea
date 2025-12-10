"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import UserAvatar from '../UserAvatar';

const FormattedMessage = ({ content }: { content: string }) => {
    const parts = content.split(/(@\w+)/g);
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

export default function ChatPanel() {
  const { messages, sendMessage, sendTypingEvent, typingUsers } = useChat();
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // MENTION STATE
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // 1. Detect Mentions & Send Notifications
    const mentions = newMessage.match(/@(\w+)/g);
    if (mentions && username) {
        const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1))));
        uniqueUsers.forEach(taggedUser => {
            if (taggedUser !== username) {
                addNotification(
                    `${username} mentioned you in Study Room`,
                    taggedUser,
                    '/study-together'
                );
            }
        });
    }

    // 2. Send Message
    sendMessage(newMessage);
    setNewMessage('');
  };
  
  // --- MENTION LOGIC ---
  const mentionableUsers = useMemo(() => { 
      if (!mentionQuery) return []; 
      const allUsers = leaderboardUsers.map(u => u.username); 
      return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5); 
  }, [mentionQuery, leaderboardUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setNewMessage(val);
      sendTypingEvent();

      const cursorPos = e.target.selectionStart || 0;
      const textBeforeCursor = val.slice(0, cursorPos);
      const match = textBeforeCursor.match(/@(\w*)$/);
      
      if (match) {
          setMentionQuery(match[1]);
          setMentionIndex(0);
      } else {
          setMentionQuery(null);
      }
  };

  const insertMention = (user: string) => {
      if (!mentionQuery) return;
      const cursorPos = inputRef.current?.selectionStart || 0;
      const textBefore = newMessage.slice(0, cursorPos).replace(/@(\w*)$/, `@${user} `);
      const textAfter = newMessage.slice(cursorPos);
      setNewMessage(textBefore + textAfter);
      setMentionQuery(null);
      inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (mentionQuery && mentionableUsers.length > 0) {
          if (e.key === 'ArrowUp') {
              e.preventDefault();
              setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1));
          } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0));
          } else if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              insertMention(mentionableUsers[mentionIndex]);
          } else if (e.key === 'Escape') {
              setMentionQuery(null);
          }
      }
  };

  useEffect(() => {
    if (messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const getTypingMessage = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return 'Several people are typing...';
  };

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white flex flex-col h-[480px] w-full shadow-xl relative">
      <CardHeader className="p-4 border-b border-white/20 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Group Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full pr-4">
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.username === username;
              return (
                <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                   {!isCurrentUser && (
                     <UserAvatar 
                        username={msg.username} 
                        fallbackUrl={msg.photoURL}
                        className="w-8 h-8 shrink-0" 
                     />
                   )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                     <div className={`rounded-lg px-3 py-2 max-w-[240px] break-words ${isCurrentUser ? 'bg-primary/80 text-primary-foreground' : 'bg-black/30'}`}>
                        {!isCurrentUser && <p className="text-xs font-bold text-accent mb-1">{msg.username}</p>}
                        <p className="text-sm leading-relaxed">
                            <FormattedMessage content={msg.message} />
                        </p>
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

        {/* Mention Dropup - Adjusted Position */}
        {mentionQuery && mentionableUsers.length > 0 && (
            <div className="absolute bottom-2 left-4 bg-[#1e1e24] border border-white/10 rounded-lg shadow-2xl overflow-hidden w-64 z-50 select-none animate-in slide-in-from-bottom-2 fade-in">
                <div className="px-3 py-2 text-xs uppercase font-bold text-white/40 tracking-wider bg-white/5">Members</div>
                {mentionableUsers.map((u, i) => (
                    <div 
                        key={u} 
                        className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${i === mentionIndex ? 'bg-indigo-500/20 text-white' : 'text-white/70 hover:bg-white/5'}`} 
                        onClick={() => insertMention(u)}
                    >
                        <UserAvatar username={u} className="w-6 h-6" /><span className="text-sm">{u}</span>
                    </div>
                ))}
            </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-white/20 shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex h-10 w-full rounded-md border border-white/30 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" size="icon" variant="primary" className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}