"use client";

import { useState, useEffect, useRef, useMemo, Suspense, useLayoutEffect } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// FIX: Added 'Smile' to imports
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft, Loader2, Star, ChevronDown, Flag, Smile } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from 'emoji-picker-react';

import { api } from '@/lib/api';
import { compressImage } from '@/lib/compress';
import { db } from '@/lib/firebase';
import { ref, onValue, set, serverTimestamp, push } from 'firebase/database';
import { Scrollable } from '@/features/ui/Scrollable';
import MessageBubble from '@/features/chat/MessageBubble';
import GiphyPicker from '@/features/media/GiphyPicker';
import JournalListCard from '@/features/journal/JournalListCard';

// Types
type Journal = { id: number; username: string; title: string; tags: string; images?: string; last_updated: number; };
type Post = { id: number; username: string; content: string; image_url?: string; created_at: number; reactions?: any[] };

function JournalContent() {
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  // State
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  
  // UI State
  const [newMessage, setNewMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const cardInputRef = useRef<HTMLInputElement>(null); 
  const [updatingJournalId, setUpdatingJournalId] = useState<number | null>(null);

  // --- 1. DATA LOADING ---
  const fetchJournals = async () => {
     try {
       const list = await api.journal.list();
       setJournals(list);
       return list;
     } catch (e) { console.error(e); return []; }
  };

  const fetchPosts = async (id: number, before?: number) => {
    try {
        const newPosts = await api.journal.getPosts(id, before);
        if (before) {
            setPosts(prev => [...newPosts, ...prev]);
            setLoadingMore(false);
        } else {
            setPosts(newPosts); 
        }
    } catch (e) { console.error(e); setLoadingMore(false); }
  };

  useEffect(() => {
    const init = async () => {
        if (username) {
            // Fetch following list manually since it's not in base API wrapper yet
             try {
                const res = await fetch(`https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/following?username=${username}`);
                const data = await res.json();
                setFollowedIds(data);
             } catch(e) {}
        }
        
        const list = await fetchJournals();
        
        const targetId = searchParams.get('id');
        if (targetId) {
            const found = list.find(j => j.id.toString() === targetId);
            if (found) setActiveJournal(found);
        }
    };
    init();

    return onValue(ref(db, 'journal_global_signal/last_updated'), (snap) => {
        if (snap.exists()) fetchJournals();
    });
  }, [username, searchParams]);

  useEffect(() => {
    if (!activeJournal) return;
    setPosts([]);
    fetchPosts(activeJournal.id);
    
    const signalRef = ref(db, `journal_signals/${activeJournal.id}`);
    return onValue(signalRef, (snap) => {
       if (snap.exists()) fetchPosts(activeJournal.id, undefined);
    });
  }, [activeJournal]);

  // --- 2. ACTIONS ---
  
  const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollTop < 50 && !loadingMore && posts.length > 0) {
          setLoadingMore(true);
          fetchPosts(activeJournal!.id, posts[0].created_at);
      }
  };

  const sendMessage = async (content: string = newMessage, imgUrl?: string) => {
      if ((!content.trim() && !imgUrl) || !activeJournal || !username) return;
      
      const tempPost = { 
          id: Date.now(), username, content, image_url: imgUrl, created_at: Date.now() 
      };
      setPosts(prev => [...prev, tempPost]);
      setNewMessage("");

      try {
          await api.journal.postMessage({
              journal_id: activeJournal.id,
              username,
              content,
              image_url: imgUrl
          });
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
      toast({ title: "Feature pending implementation in api.ts" });
  };

  // --- 4. RENDER ---
  const sortedJournals = useMemo(() => {
      return [...journals].sort((a, b) => {
          const aF = followedIds.includes(a.id) ? 1 : 0;
          const bF = followedIds.includes(b.id) ? 1 : 0;
          return (bF - aF) || (b.last_updated - a.last_updated);
      });
  }, [journals, followedIds]);

  return (
    <div className="min-h-screen text-white bg-transparent overflow-hidden">
      <Header />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleChatUpload} />
      <input type="file" ref={cardInputRef} className="hidden" multiple accept="image/*" onChange={handleCardUpload} />

      <main className="container mx-auto pt-20 px-4 h-screen flex gap-6 pb-4">
        
        <div className={`flex-shrink-0 w-full md:w-[38%] lg:w-[35%] flex flex-col rounded-2xl overflow-hidden ${activeJournal ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex justify-end items-center p-4 shrink-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="secondary" className="glass-panel-light hover:bg-white/20"><Plus className="w-4 h-4 mr-1" /> New Journal</Button></DialogTrigger>
                    <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                        <DialogHeader><DialogTitle>Create Journal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/20" />
                            <Input placeholder="Tags" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/20" />
                            <Button onClick={handleCreateJournal} className="w-full bg-accent text-black">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Scrollable className="flex-1 p-3 space-y-3" thin>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
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
            </Scrollable>
        </div>

        <div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden ${!activeJournal ? 'hidden md:flex' : 'flex'}`}>
            {activeJournal ? (
                <>
                    <div className="h-16 glass-panel-light flex items-center px-6 shrink-0 justify-between">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveJournal(null)}><ArrowLeft className="w-4 h-4" /></Button>
                            <div>
                                <span className="font-bold text-lg text-white truncate"># {activeJournal.title}</span>
                                <span className="text-sm text-white/40 ml-2 hidden sm:inline">by {activeJournal.username}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button size="icon" variant="ghost">
                                <Star className={`w-5 h-5 ${followedIds.includes(activeJournal.id) ? 'fill-accent text-accent' : 'text-white/40'}`} />
                             </Button>
                        </div>
                    </div>

                    <Scrollable ref={scrollRef} onScroll={handleScroll} className="flex-1 p-0">
                        <div className="p-4 pb-2 min-h-full flex flex-col justify-end">
                            {loadingMore && <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
                            
                            {posts.map((post, index) => {
                                const isSequence = index > 0 && posts[index - 1].username === post.username;
                                const timeDiff = index > 0 ? post.created_at - posts[index - 1].created_at : 0;
                                const showHeader = !isSequence || timeDiff > 600000;

                                return (
                                    <MessageBubble 
                                        key={post.id}
                                        message={{
                                            ...post,
                                            timestamp: post.created_at,
                                            message: post.content 
                                        }}
                                        isCurrentUser={post.username === username}
                                        showHeader={showHeader}
                                        // FIX: Added Type string
                                        onReact={(emoji: string) => handleReact(post.id, emoji)}
                                        onReport={() => {}}
                                        onDelete={() => {}}
                                    />
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                    </Scrollable>

                    <div className="p-4 glass-panel-light shrink-0">
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
                                value={newMessage} 
                                onChange={e => setNewMessage(e.target.value)} 
                                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
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