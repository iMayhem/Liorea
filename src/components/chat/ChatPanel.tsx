"use client";

import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, MessageSquare, Plus, Film, Smile, Search, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import UserAvatar from '../UserAvatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const GIPHY_API_KEY = "15K9ijqVrmDOKdieZofH1b6SFR7KuqG5";
const QUICK_EMOJIS = ["🔥", "❤️", "👍", "😂", "😮", "😢"];

type GiphyResult = { id: string; images: { fixed_height: { url: string }; original: { url: string }; } }

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
  const { messages, sendMessage, sendReaction, sendTypingEvent, typingUsers, loadMoreMessages, hasMore } = useChat();
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const [newMessage, setNewMessage] = useState('');
  
  // SCROLL REFS
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // UX STATES
  const [isInitialLoaded, setIsInitialLoaded] = useState(false); // Controls Opacity
  const [showScrollButton, setShowScrollButton] = useState(false);
  const prevScrollHeight = useRef(0);

  // GIF & Emoji State
  const [gifs, setGifs] = useState<GiphyResult[]>([]);
  const [gifSearch, setGifSearch] = useState("");
  const [loadingGifs, setLoadingGifs] = useState(false);
  const [openReactionPopoverId, setOpenReactionPopoverId] = useState<string | null>(null);

  // Mention State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- SCROLL LOGIC ---
  
  // 1. TELEPORT TO BOTTOM (Initial Load)
  // We use useLayoutEffect because it runs synchronously before the browser paints the screen.
  // This guarantees the user never sees the top of the chat.
  useLayoutEffect(() => {
      if (messages.length > 0 && !isInitialLoaded) {
          if (scrollContainerRef.current) {
              // Instantly jump to bottom without animation
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
          // Reveal the chat
          setIsInitialLoaded(true);
      }
  }, [messages, isInitialLoaded]);

  // 2. AUTO-SCROLL on New Message (Only if user is already at bottom)
  useEffect(() => {
      if (isInitialLoaded && messages.length > 0) {
          const container = scrollContainerRef.current;
          if (container) {
              const { scrollTop, scrollHeight, clientHeight } = container;
              // If user is near bottom (<150px), auto scroll smoothly
              if (scrollHeight - scrollTop - clientHeight < 150) {
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              }
          }
      }
  }, [messages.length, isInitialLoaded]);

  // 3. PAGINATION (Scroll Up to Load More)
  const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Show/Hide "Scroll to Bottom" Button
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);

      // Trigger Load More when scrolling near top (<50px)
      if (scrollTop < 50 && hasMore) {
          prevScrollHeight.current = scrollHeight; // Capture height before loading
          loadMoreMessages();
      }
  };

  // 4. RESTORE POSITION (After loading older messages)
  useLayoutEffect(() => {
      const container = scrollContainerRef.current;
      // If we just loaded older messages (height increased significantly)
      if (container && prevScrollHeight.current > 0 && container.scrollHeight > prevScrollHeight.current) {
          const newScrollHeight = container.scrollHeight;
          const diff = newScrollHeight - prevScrollHeight.current;
          // Instantly adjust scroll position so the user's view doesn't jump
          container.scrollTop = diff + container.scrollTop; 
          prevScrollHeight.current = 0; // Reset
      }
  }, [messages]);


  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

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

  const handleSendGif = (url: string) => { sendMessage("", url); };

  const fetchGifs = async (query: string = "") => {
      setLoadingGifs(true);
      try {
          const endpoint = query 
            ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=g`
            : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;
          const res = await fetch(endpoint);
          const data = await res.json();
          setGifs(data.data);
      } catch (error) { console.error("Failed to fetch GIFs", error); } finally { setLoadingGifs(false); }
  };
  
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

  const getTypingMessage = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return 'Several people are typing...';
  };

  const getReactionGroups = (reactions: Record<string, any> | undefined) => {
      if (!reactions) return {};
      const groups: Record<string, { count: number, hasReacted: boolean }> = {};
      Object.values(reactions).forEach((r: any) => {
          if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false };
          groups[r.emoji].count++;
          if (r.username === username) groups[r.emoji].hasReacted = true;
      });
      return groups;
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white flex flex-col h-[480px] w-full shadow-xl relative overflow-hidden">
      <CardHeader className="p-4 border-b border-white/20 shrink-0 bg-black/20">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Group Chat
        </CardTitle>
      </CardHeader>
      
      {/* Messages Area - Using Native Div for precise scroll control */}
      {/* Opacity transition hides the 'teleport' glitch */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 p-0 overflow-y-auto no-scrollbar relative transition-opacity duration-500 ease-in ${isInitialLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
          <div className="p-4 pb-2 min-h-full flex flex-col justify-end">
            {hasMore && <div className="text-center py-4 text-xs text-white/30"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
            
            {messages.map((msg, index) => {
              const isSequence = index > 0 && messages[index - 1].username === msg.username;
              const timeDiff = index > 0 ? msg.timestamp - messages[index - 1].timestamp : 0;
              const showHeader = !isSequence || timeDiff > 300000; // 5 mins
              
              const isCurrentUser = msg.username === username;
              const reactionGroups = getReactionGroups(msg.reactions);

              return (
                <div 
                    key={msg.id} 
                    className={`group relative flex gap-4 pr-2 hover:bg-white/[0.04] -mx-4 px-4 transition-colors ${showHeader ? 'mt-6' : 'mt-0.5 py-0.5'}`}
                >
                   <div className="w-10 shrink-0 select-none pt-0.5">
                       {showHeader ? (
                            <UserAvatar username={msg.username} fallbackUrl={msg.photoURL} className="w-10 h-10 hover:opacity-90 cursor-pointer" />
                       ) : (
                           <div className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 text-right w-full pr-2 pt-1 select-none">
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                           </div>
                       )}
                   </div>

                   <div className="flex-1 min-w-0">
                        {showHeader && (
                            <div className="flex items-center gap-2 mb-1 select-none">
                                <span className="text-base font-semibold text-white hover:underline cursor-pointer">{msg.username}</span>
                                <span className="text-xs text-white/30 ml-1">{formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}</span>
                            </div>
                        )}

                        <div className="text-base text-zinc-100 leading-[1.375rem] whitespace-pre-wrap break-words font-light tracking-wide">
                            {msg.image_url ? (
                                <img src={msg.image_url} alt="GIF" className="max-w-[250px] rounded-lg mt-1" loading="lazy" />
                            ) : (
                                <FormattedMessage content={msg.message} />
                            )}
                        </div>

                        {Object.keys(reactionGroups).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 select-none">
                                {Object.entries(reactionGroups).map(([emoji, data]) => (
                                    <button 
                                        key={emoji} 
                                        onClick={() => sendReaction(msg.id, emoji)} 
                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border transition-colors ${data.hasReacted ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-[#2b2d31] border-transparent hover:border-white/20'}`}
                                    >
                                        <span className="text-base">{emoji}</span>
                                        <span className={`text-xs font-bold ${data.hasReacted ? 'text-indigo-200' : 'text-zinc-300'}`}>{data.count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                   </div>

                   <div className="absolute right-4 -top-2 bg-[#111113] shadow-sm rounded-[4px] border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center p-0.5 z-10">
                        <Popover open={openReactionPopoverId === msg.id} onOpenChange={(open) => setOpenReactionPopoverId(open ? msg.id : null)}>
                            <PopoverTrigger asChild>
                                <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                                    <Smile className="w-4 h-4" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1.5 bg-[#18181b] border border-white/10 rounded-lg shadow-xl" side="top" align="end" sideOffset={5}>
                                <div className="flex gap-1">
                                    {QUICK_EMOJIS.map(emoji => (
                                        <button key={emoji} className="p-2 hover:bg-white/10 rounded-md text-xl transition-colors" onClick={() => { sendReaction(msg.id, emoji); setOpenReactionPopoverId(null); }}>{emoji}</button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                   </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
      </div>
      
      {/* Scroll Down Button */}
      {showScrollButton && (
          <button 
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="absolute bottom-20 right-6 p-2 rounded-full bg-black/60 border border-white/10 text-white shadow-xl hover:bg-black/80 transition-all animate-in fade-in zoom-in z-20"
          >
              <ChevronDown className="w-5 h-5" />
          </button>
      )}

      {typingUsers.length > 0 && (
          <div className="absolute bottom-16 left-4 text-xs text-muted-foreground italic animate-pulse bg-black/40 px-2 py-1 rounded z-20">
              {getTypingMessage()}
          </div>
      )}

      {/* Mention Dropup */}
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

      <CardFooter className="p-3 border-t border-white/20 shrink-0 bg-black/20">
        <div className="flex w-full items-end gap-2">
            <div className="flex gap-1 pb-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white rounded-full"><Film className="w-4 h-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-72 p-2 bg-[#1e1e24] border-white/10 text-white">
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2 w-3 h-3 text-white/40" />
                                <Input placeholder="GIFs..." className="h-7 pl-7 bg-black/20 border-white/10 text-xs" value={gifSearch} onChange={(e) => { setGifSearch(e.target.value); fetchGifs(e.target.value); }} />
                            </div>
                            <div className="h-48 overflow-y-auto no-scrollbar grid grid-cols-2 gap-1">
                                {loadingGifs ? <div className="col-span-2 text-center py-4 text-xs text-white/40">Loading...</div> : gifs.map(gif => (
                                    <img key={gif.id} src={gif.images.fixed_height.url} className="w-full h-auto object-cover rounded cursor-pointer hover:opacity-80" onClick={() => handleSendGif(gif.images.original.url)} />
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

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