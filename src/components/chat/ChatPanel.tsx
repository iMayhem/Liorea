"use client";

import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Send, MessageSquare, ChevronDown, Smile, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

// --- CONTEXT & HOOKS ---
import { useChat, ChatMessage } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/UserAvatar';

// --- ISOLATED FEATURES (The Simplified Parts) ---
import GiphyPicker from '@/features/media/GiphyPicker';
import MessageBubble from '@/features/chat/MessageBubble';
import { Scrollable } from '@/features/ui/Scrollable';

export default function ChatPanel() {
  const { messages, sendMessage, sendReaction, sendTypingEvent, typingUsers, loadMoreMessages, hasMore } = useChat();
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  
  // State
  const [newMessage, setNewMessage] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevScrollHeight = useRef(0);

  // --- 1. SCROLL HANDLING ---
  useLayoutEffect(() => {
      if (messages.length > 0 && !isInitialLoaded) {
          if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
          setIsInitialLoaded(true);
      }
  }, [messages, isInitialLoaded]);

  useEffect(() => {
      if (isInitialLoaded && messages.length > 0) {
          const container = scrollContainerRef.current;
          if (container) {
              const { scrollTop, scrollHeight, clientHeight } = container;
              // Auto-scroll if near bottom
              if (scrollHeight - scrollTop - clientHeight < 150) {
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              }
          }
      }
  }, [messages.length, isInitialLoaded]);

  const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
      
      if (scrollTop < 50 && hasMore) {
          prevScrollHeight.current = scrollHeight; 
          loadMoreMessages();
      }
  };

  useLayoutEffect(() => {
      const container = scrollContainerRef.current;
      if (container && prevScrollHeight.current > 0 && container.scrollHeight > prevScrollHeight.current) {
          const diff = container.scrollHeight - prevScrollHeight.current;
          container.scrollTop = diff + container.scrollTop; 
          prevScrollHeight.current = 0; 
      }
  }, [messages]);

  // --- 2. ACTIONS ---
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    // Mention Notifications
    const mentions = newMessage.match(/@(\w+)/g);
    if (mentions && username) {
        const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1))));
        uniqueUsers.forEach(taggedUser => {
            if (taggedUser !== username) {
                addNotification(`${username} mentioned you in Study Room`, taggedUser, '/study-together');
            }
        });
    }

    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleReportMessage = async (msg: ChatMessage) => {
      if(!username) return;
      try {
          await push(ref(db, 'reports'), {
              reporter: username,
              reported_user: msg.username,
              message_content: msg.message || "Image/GIF",
              message_id: msg.id,
              room: "Study Room",
              timestamp: serverTimestamp(),
              status: "pending"
          });
          toast({ title: "Report Sent", description: "Admins have been notified." });
      } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Could not send report." });
      }
  };

  // --- 3. MENTION INPUT LOGIC ---
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
      if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); }
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

  return (
    <Card className="glass-panel text-white flex flex-col h-[480px] w-full relative overflow-hidden rounded-2xl">
      
      {/* HEADER */}
      <CardHeader className="p-4 shrink-0 glass-panel-light">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Group Chat
        </CardTitle>
      </CardHeader>
      
      {/* MESSAGES LIST */}
      <Scrollable 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 p-0 transition-opacity duration-500 ease-in ${isInitialLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
          <div className="p-4 pb-2 min-h-full flex flex-col justify-end">
            {hasMore && <div className="text-center py-4 text-xs text-white/30"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
            
            {/* --- THE SIMPLIFIED RENDERING LOOP --- */}
            {messages.map((msg, index) => {
              // Logic for visual grouping
              const isSequence = index > 0 && messages[index - 1].username === msg.username;
              const timeDiff = index > 0 ? msg.timestamp - messages[index - 1].timestamp : 0;
              const showHeader = !isSequence || timeDiff > 300000; // 5 mins

              return (
                <MessageBubble 
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.username === username}
                    showHeader={showHeader}
                    // FIXED: Explicit type for emoji
                    onReact={(emoji: string) => sendReaction(msg.id, emoji)}
                    onReport={() => handleReportMessage(msg)}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
      </Scrollable>
      
      {/* FLOATING UI ELEMENTS */}
      
      {/* 1. Scroll To Bottom Button */}
      {showScrollButton && (
          <button 
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="absolute bottom-20 right-6 p-2 rounded-full bg-black/60 border border-white/10 text-white shadow-xl hover:bg-black/80 transition-all animate-in fade-in zoom-in z-20"
          >
              <ChevronDown className="w-5 h-5" />
          </button>
      )}

      {/* 2. Typing Indicator */}
      {typingUsers.length > 0 && (
          <div className="absolute bottom-16 left-4 text-xs text-muted-foreground italic animate-pulse bg-black/40 px-2 py-1 rounded z-20">
              {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : 'Several people are typing...'}
          </div>
      )}

      {/* 3. Mention Popup */}
      {mentionQuery && mentionableUsers.length > 0 && (
          <div className="absolute bottom-0 left-4 bg-[#1e1e24] border border-white/10 rounded-t-lg shadow-2xl overflow-hidden w-64 z-50 select-none animate-in slide-in-from-bottom-2 fade-in">
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

      {/* INPUT FOOTER */}
      <CardFooter className="p-3 shrink-0 glass-panel-light">
        <div className="flex w-full items-end gap-2">
            <div className="flex gap-1 pb-1">
                
                {/* Isolated Giphy Picker */}
                <GiphyPicker onSelect={(url) => sendMessage("", url)} />
                
                {/* Main Emoji Picker (For Input Field) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-full"><Smile className="w-4 h-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-auto p-0 border-none bg-transparent shadow-none">
                        <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} height={350} searchDisabled skinTonesDisabled />
                    </PopoverContent>
                </Popover>
            </div>

            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Message..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-white placeholder:text-white/30 h-10 py-2 px-0"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <Button type="submit" size="icon" variant="ghost" disabled={!newMessage.trim()} className="h-10 w-10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full">
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
      </CardFooter>
    </Card>
  );
}