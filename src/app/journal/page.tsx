"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft, Loader2, Star, Smile, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { api } from '@/lib/api';
import { compressImage } from '@/lib/compress';
import { db } from '@/lib/firebase';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { Scrollable } from '@/features/ui/Scrollable';
import MessageBubble from '@/features/chat/MessageBubble';
import GiphyPicker from '@/features/media/GiphyPicker';
import JournalListCard from '@/features/journal/JournalListCard';
import UserAvatar from '@/components/UserAvatar';

// Types
type Journal = { id: number; username: string; title: string; tags: string; images?: string; last_updated: number; };
type Post = { id: number; username: string; content: string; image_url?: string; created_at: number; reactions?: any[] };

function JournalContent() {
  const { username } = usePresence();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [currentFollowers, setCurrentFollowers] = useState<string[]>([]); // New State for Header Avatars
  
  const [newMessage, setNewMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Mention State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const cardInputRef = useRef<HTMLInputElement>(null); 
  const inputRef = useRef<HTMLTextAreaElement>(null); // Changed to TextArea
  const [updatingJournalId, setUpdatingJournalId] = useState<number | null>(null);

  // --- DATA LOADING ---
  useEffect(() => {
    const init = async () => {
        if (username) {
             try {
                // Fetch Following List
                const res = await fetch(`https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/following?username=${username}`);
                const data = await res.json();
                if(Array.isArray(data)) setFollowedIds(data);
             } catch(e) {}
        }
        
        setIsListLoading(true);
        try {
            const list = await api.journal.list();
            if (Array.isArray(list)) setJournals(list);
        } finally { setIsListLoading(false); }

        // URL Sync
        const targetId = searchParams.get('id');
        if (targetId) {
            // Need to wait for journals to be set, handled in separate effect or logic here?
            // Better to let the user effect below handle it when journals update
        }
    };
    init();

    return onValue(ref(db, 'journal_global_signal/last_updated'), (snap) => {
        if (snap.exists()) {
             api.journal.list().then(list => Array.isArray(list) && setJournals(list));
        }
    });
  }, [username]);

  // Handle Selection from URL when Journals Load
  useEffect(() => {
      const targetId = searchParams.get('id');
      if (targetId && journals.length > 0 && !activeJournal) {
          const found = journals.find(j => j.id.toString() === targetId);
          if (found) setActiveJournal(found);
      }
  }, [searchParams, journals, activeJournal]);

  // Active Journal Logic
  useEffect(() => {
    if (!activeJournal) return;
    setPosts([]);
    setCurrentFollowers([]); // Reset followers
    
    // Fetch Posts
    const loadPosts = async () => {
        try {
            const newPosts = await api.journal.getPosts(activeJournal.id);
            setPosts(newPosts);
            setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
        } catch (e) {}
    };
    loadPosts();

    // Fetch Followers for Header
    const loadFollowers = async () => {
        try {
            const res = await fetch(`https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/followers?id=${activeJournal.id}`);
            const data = await res.json();
            if(Array.isArray(data)) setCurrentFollowers(data);
        } catch(e) {}
    };
    loadFollowers();
    
    const signalRef = ref(db, `journal_signals/${activeJournal.id}`);
    return onValue(signalRef, (snap) => {
       if (snap.exists()) loadPosts();
    });
  }, [activeJournal]);

  // --- ACTIONS ---
  const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollTop < 50 && !loadingMore && posts.length > 0) {
          setLoadingMore(true);
          api.journal.getPosts(activeJournal!.id, posts[0].created_at).then(older => {
              if (older.length) setPosts(prev => [...older, ...prev]);
              setLoadingMore(false);
          });
      }
  };

  const handleFollowToggle = async () => {
      if (!activeJournal || !username) return;
      const isFollowing = followedIds.includes(activeJournal.id);
      
      // Optimistic Update
      if (isFollowing) {
          setFollowedIds(prev => prev.filter(id => id !== activeJournal.id));
          setCurrentFollowers(prev => prev.filter(u => u !== username));
      } else {
          setFollowedIds(prev => [...prev, activeJournal.id]);
          setCurrentFollowers(prev => [username, ...prev]);
      }

      try {
          await fetch('https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/follow', { 
              method: 'POST', body: JSON.stringify({ journal_id: activeJournal.id, username }), headers: { 'Content-Type': 'application/json' } 
          });
      } catch (e) { } // Revert if needed
  };

  const sendMessage = async (content: string = newMessage, imgUrl?: string) => {
      if ((!content.trim() && !imgUrl) || !activeJournal || !username) return;
      
      // Mention Notification
      const mentions = content.match(/@(\w+)/g);
      if (mentions) {
          const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1))));
          uniqueUsers.forEach(taggedUser => {
              if (taggedUser !== username) addNotification(`${username} mentioned you in "${activeJournal.title}"`, taggedUser, `/journal?id=${activeJournal.id}`);
          });
      }

      const tempPost = { id: Date.now(), username, content, image_url: imgUrl, created_at: Date.now() };
      setPosts(prev => [...prev, tempPost]);
      setNewMessage("");
      setMentionQuery(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

      try {
          await api.journal.postMessage({ journal_id: activeJournal.id, username, content, image_url: imgUrl });
          set(ref(db, `journal_signals/${activeJournal.id}`), serverTimestamp());
      } catch (e) { toast({ variant: "destructive", title: "Error sending" }); }
  };

  const handleCreateJournal = async () => {
      if (!newTitle.trim() || !username) return;
      await api.journal.create({ username, title: newTitle, tags: newTags, theme: "bg-black" });
      setNewTitle(""); setIsDialogOpen(false);
      set(ref(db, 'journal_global_signal/last_updated'), serverTimestamp());
  };

  const handleReact = async (postId: number, emoji: string) => {
      if(!username) return;
      await api.journal.react({ post_id: postId, username, emoji });
      if (activeJournal) set(ref(db, `journal_signals/${activeJournal.id}`), serverTimestamp());
  };

  const handleChatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setIsUploading(true);
          const compressed = await compressImage(e.target.files[0]);
          const { url } = await api.media.upload(compressed);
          await sendMessage("", url);
          setIsUploading(false);
      }
  };

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!updatingJournalId || !e.target.files) return;
      try {
          toast({ title: "Uploading covers..." });
          const urls: string[] = [];
          for (const file of Array.from(e.target.files)) {
              const compressed = await compressImage(file);
              const { url } = await api.media.upload(compressed);
              urls.push(url);
          }
          await fetch('https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/update_images', {
              method: 'POST', body: JSON.stringify({ id: updatingJournalId, images: urls.join(","), username }), headers: { 'Content-Type': 'application/json' }
          });
          set(ref(db, 'journal_global_signal/last_updated'), serverTimestamp());
      } catch(e) {}
  };

  // --- MENTION LOGIC ---
  const mentionableUsers = useMemo(() => {
      if (!mentionQuery) return [];
      const chatUsers = posts.map(p => p.username);
      const allUsers = Array.from(new Set([...chatUsers, ...currentFollowers]));
      return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5);
  }, [mentionQuery, posts, currentFollowers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setNewMessage(val);
      const cursorPos = e.target.selectionStart || 0;
      const textBeforeCursor = val.slice(0, cursorPos);
      const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
      if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); }
  };

  const insertMention = (user: string) => {
      const cursorPos = inputRef.current?.selectionStart || 0;
      const textBefore = newMessage.slice(0, cursorPos).replace(/@([a-zA-Z0-9_]*)$/, `@${user} `);
      const textAfter = newMessage.slice(cursorPos);
      setNewMessage(textBefore + textAfter);
      setMentionQuery(null);
      inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionQuery && mentionableUsers.length > 0) {
          if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1)); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0)); }
          else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionableUsers[mentionIndex]); }
          else if (e.key === 'Escape') { setMentionQuery(null); }
          return;
      }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Sort logic: Followed First
  const sortedJournals = useMemo(() => {
      return [...journals].sort((a, b) => {
          const aF = followedIds.includes(a.id) ? 1 : 0;
          const bF = followedIds.includes(b.id) ? 1 : 0;
          if (aF !== bF) return bF - aF;
          return b.last_updated - a.last_updated;
      });
  }, [journals, followedIds]);

  return (
    <div className="min-h-screen text-white bg-transparent overflow-hidden">
      <Header />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleChatUpload} />
      <input type="file" ref={cardInputRef} className="hidden" multiple accept="image/*" onChange={handleCardUpload} />

      <main className="container mx-auto pt-20 px-4 h-screen flex gap-6 pb-4">
        
        {/* LEFT PANEL */}
        <div className={`flex-shrink-0 w-full md:w-[38%] lg:w-[35%] flex flex-col h-full min-h-0 rounded-2xl overflow-hidden glass-panel ${activeJournal ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex justify-end items-center p-4 shrink-0 border-b border-white/5">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="secondary" className="glass-panel-light hover:bg-white/20"><Plus className="w-4 h-4 mr-1" /> New Journal</Button></DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-xl border-white/20 text-white">
                        <DialogHeader><DialogTitle>Create Journal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Input placeholder="Tags" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Button onClick={handleCreateJournal} className="w-full bg-white text-black hover:bg-white/90">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Scrollable className="flex-1 p-3 min-h-0" thin>
                {isListLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                            <span className="text-xs text-white/40">Loading journals...</span>
                        </div>
                    </div>
                ) : sortedJournals.length === 0 ? (
                    <div className="text-center p-8 text-white/40 text-sm">No journals yet. Create one to start!</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-4">
                        {sortedJournals.map(j => (
                            <JournalListCard 
                                key={j.id}
                                journal={j}
                                isActive={activeJournal?.id === j.id}
                                isFollowing={followedIds.includes(j.id)}
                                isOwner={j.username === username}
                                onClick={() => { setActiveJournal(j); router.push(`/journal?id=${j.id}`); }}
                                onUpload={(e) => { e.stopPropagation(); setUpdatingJournalId(j.id); cardInputRef.current?.click(); }}
                                onDelete={(e) => { e.stopPropagation(); }}
                            />
                        ))}
                    </div>
                )}
            </Scrollable>
        </div>

        {/* RIGHT PANEL */}
        <div className={`flex-1 flex flex-col h-full min-h-0 glass-panel rounded-2xl overflow-hidden ${!activeJournal ? 'hidden md:flex' : 'flex'}`}>
            {activeJournal ? (
                <>
                    {/* Header */}
                    <div className="h-16 glass-panel-light flex items-center px-6 shrink-0 justify-between z-10">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveJournal(null)}><ArrowLeft className="w-4 h-4" /></Button>
                            <div>
                                <span className="font-bold text-lg text-white truncate"># {activeJournal.title}</span>
                                <span className="text-sm text-white/40 ml-2 hidden sm:inline">by {activeJournal.username}</span>
                            </div>
                        </div>
                        
                        {/* Followers + Star Button */}
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <div className="flex -space-x-2">
                                    {currentFollowers.slice(0, 3).map((u, i) => (
                                        <Tooltip key={i}>
                                            <TooltipTrigger>
                                                <UserAvatar username={u} className="w-6 h-6 border border-black" />
                                            </TooltipTrigger>
                                            <TooltipContent><p>{u}</p></TooltipContent>
                                        </Tooltip>
                                    ))}
                                    {currentFollowers.length > 3 && <div className="w-6 h-6 rounded-full bg-white/10 text-[10px] flex items-center justify-center">+{currentFollowers.length - 3}</div>}
                                </div>
                            </TooltipProvider>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <Button size="icon" variant="ghost" onClick={handleFollowToggle} className={followedIds.includes(activeJournal.id) ? 'text-accent' : 'text-white/40'}>
                                <Star className={`w-5 h-5 ${followedIds.includes(activeJournal.id) ? 'fill-accent' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 min-h-0 relative">
                        <Scrollable ref={scrollRef} onScroll={handleScroll} className="p-0">
                            <div className="p-4 pb-2 min-h-full flex flex-col justify-end">
                                {loadingMore && <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto text-white/30" /></div>}
                                
                                {posts.length === 0 && !loadingMore && (
                                    <div className="text-center text-white/30 py-10 flex flex-col items-center gap-2">
                                        <Hash className="w-8 h-8 opacity-20" />
                                        <span>No posts yet. Be the first!</span>
                                    </div>
                                )}

                                {posts.map((post, index) => {
                                    const isSequence = index > 0 && posts[index - 1].username === post.username;
                                    const timeDiff = index > 0 ? post.created_at - posts[index - 1].created_at : 0;
                                    const showHeader = !isSequence || timeDiff > 600000;

                                    return (
                                        <MessageBubble 
                                            key={post.id}
                                            message={{ ...post, timestamp: post.created_at, message: post.content }}
                                            isCurrentUser={post.username === username}
                                            showHeader={showHeader}
                                            onReact={(emoji: string) => handleReact(post.id, emoji)}
                                        />
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                        </Scrollable>

                        {/* Mention Popup */}
                        {mentionQuery && mentionableUsers.length > 0 && (
                            <div className="absolute bottom-2 left-4 right-4 bg-[#1e1e24] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                                <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/40 bg-white/5">Members</div>
                                {mentionableUsers.map((u, i) => (
                                    <div key={u} className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${i === mentionIndex ? 'bg-indigo-500/20 text-white' : 'text-white/70 hover:bg-white/5'}`} onClick={() => insertMention(u)}>
                                        <UserAvatar username={u} className="w-5 h-5" /><span className="text-sm">{u}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 glass-panel-light shrink-0 z-10">
                        <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                            <GiphyPicker onSelect={(url) => sendMessage("", url)} />
                            <Button variant="ghost" size="icon" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-white rounded-full">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-full"><Smile className="w-5 h-5" /></Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" className="w-auto p-0 border-none bg-transparent shadow-none">
                                    <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} height={400} />
                                </PopoverContent>
                            </Popover>
                            <textarea 
                                ref={inputRef}
                                value={newMessage} 
                                onChange={handleInputChange} 
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${activeJournal.title}`} 
                                className="w-full bg-transparent border-none focus:ring-0 text-white text-base resize-none py-1.5 max-h-32 min-h-[36px]" 
                                rows={1} 
                            />
                            <Button onClick={() => sendMessage()} disabled={!newMessage.trim()} className="bg-white/10 hover:bg-white text-white hover:text-black rounded-full h-9 w-9 p-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/20 select-none">
                    <Hash className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select a journal to start reading</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white/50">Loading...</div>}>
        <JournalContent />
    </Suspense>
  );
}