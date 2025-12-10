"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

// Types
type Journal = {
  id: number;
  username: string;
  title: string;
  tags: string;
  theme_color: string;
  last_updated: number;
};

type Post = {
  id: number;
  username: string;
  content: string;
  image_url?: string;
  created_at: number;
  photoURL?: string; 
};

export default function JournalPage() {
  const { username } = usePresence();
  
  // State
  const [view, setView] = useState<'gallery' | 'chat'>('gallery');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Creation State
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Posting State
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Journals on Mount
  useEffect(() => {
    fetchJournals();
  }, []);

  // Poll for new posts when inside a journal (Simple realtime simulation)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'chat' && activeJournal) {
        fetchPosts(activeJournal.id);
        interval = setInterval(() => fetchPosts(activeJournal.id), 5000);
    }
    return () => clearInterval(interval);
  }, [view, activeJournal]);

  // Scroll to bottom on new posts
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts]);

  const fetchJournals = async () => {
    try {
        const res = await fetch(`${WORKER_URL}/journals/list`);
        if(res.ok) setJournals(await res.json());
    } catch (e) { console.error("Failed to load journals", e); }
  };

  const fetchPosts = async (id: number) => {
    try {
        const res = await fetch(`${WORKER_URL}/journals/posts?id=${id}`);
        if(res.ok) setPosts(await res.json());
    } catch (e) { console.error("Failed to load posts", e); }
  };

  const createJournal = async () => {
    if (!newTitle.trim() || !username) return;
    try {
        await fetch(`${WORKER_URL}/journals/create`, {
            method: "POST",
            body: JSON.stringify({ 
                username, 
                title: newTitle, 
                tags: newTags,
                theme: "bg-gradient-to-br from-indigo-500 to-purple-500" // Aesthetic default
            }),
            headers: { "Content-Type": "application/json" }
        });
        setNewTitle("");
        setNewTags("");
        setIsDialogOpen(false);
        fetchJournals();
    } catch (e) { console.error("Failed to create journal", e); }
  };

  const sendPost = async () => {
    if (!newMessage.trim() || !activeJournal || !username) return;
    
    // Optimistic update (Show immediately)
    const tempPost = { 
        id: Date.now(), 
        username, 
        content: newMessage, 
        created_at: Date.now() 
    };
    setPosts([...posts, tempPost]);
    setNewMessage("");

    try {
        await fetch(`${WORKER_URL}/journals/post`, {
            method: "POST",
            body: JSON.stringify({
                journal_id: activeJournal.id,
                username,
                content: tempPost.content
            }),
            headers: { "Content-Type": "application/json" }
        });
        // Fetch real data to sync IDs
        fetchPosts(activeJournal.id);
    } catch (e) { console.error("Failed to send post", e); }
  };

  // --- RENDER HELPERS ---
  
  const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen text-white bg-transparent">
      <Header />
      
      <main className="container mx-auto pt-24 pb-10 px-4 h-screen flex flex-col">
        
        {/* VIEW 1: GALLERY (Grid of Journals) */}
        {view === 'gallery' && (
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Community Journals</h1>
                        <p className="text-white/50">Read about others' journeys or document your own.</p>
                    </div>
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-white/90">
                                <Plus className="w-4 h-4 mr-2" /> New Journal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                            <DialogHeader>
                                <DialogTitle>Create your Space</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Journal Title</label>
                                    <Input 
                                        placeholder="e.g. My Road to IIT Bombay" 
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="bg-black/20 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Tags (Optional)</label>
                                    <Input 
                                        placeholder="JEE, 2025, Dropper" 
                                        value={newTags}
                                        onChange={e => setNewTags(e.target.value)}
                                        className="bg-black/20 border-white/20 text-white"
                                    />
                                </div>
                                <Button onClick={createJournal} className="w-full bg-accent text-white">Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {journals.map((journal) => (
                        <Card 
                            key={journal.id} 
                            onClick={() => { setActiveJournal(journal); setView('chat'); }}
                            className="group cursor-pointer bg-black/20 border-white/10 hover:border-white/30 transition-all hover:bg-black/30 overflow-hidden"
                        >
                            <div className={`h-24 w-full ${journal.theme_color || 'bg-blue-900'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                            <CardContent className="p-5 -mt-10 relative z-10">
                                <div className="flex justify-between items-end">
                                     {/* UPDATED: Using UserAvatar for the Journal Card */}
                                     <UserAvatar 
                                        username={journal.username} 
                                        className="h-16 w-16 rounded-xl border-4 border-black/20 shadow-lg text-2xl" 
                                     />
                                     
                                     <span className="text-xs text-white/50 font-mono mb-1">
                                        Updated {formatDate(journal.last_updated)}
                                     </span>
                                </div>
                                
                                <h3 className="text-xl font-bold mt-3 leading-tight group-hover:text-accent transition-colors">
                                    {journal.title}
                                </h3>
                                <p className="text-sm text-white/60 mt-1">by @{journal.username}</p>
                                
                                <div className="flex gap-2 mt-4 flex-wrap">
                                    {journal.tags && journal.tags.split(',').map((tag, i) => (
                                        <span key={i} className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-full text-white/70">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {journals.length === 0 && (
                        <div className="col-span-full text-center text-white/40 py-20">
                            No journals found. Be the first to start one!
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* VIEW 2: CHAT (Reading/Posting) */}
        {view === 'chat' && activeJournal && (
            <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden h-[calc(100vh-120px)] animate-in fade-in zoom-in-95 duration-300">
                
                {/* Channel Header */}
                <div className="h-16 border-b border-white/10 flex items-center px-4 bg-black/20 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setView('gallery')} className="mr-2 text-white/50 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-black font-bold text-xs">
                            <Hash className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white leading-none">{activeJournal.title}</h2>
                            <p className="text-xs text-white/50 mt-1">Author: {activeJournal.username}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 pb-4">
                        {/* Intro Card */}
                        <div className="flex gap-4 p-6 bg-white/5 rounded-xl border border-white/5 mb-8">
                             <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-3xl shrink-0 text-black">
                                📚
                             </div>
                             <div>
                                <h3 className="text-xl font-bold">Welcome to {activeJournal.title}!</h3>
                                <p className="text-white/60 mt-1">This is the beginning of {activeJournal.username}'s journey.</p>
                                <div className="text-xs text-white/40 mt-2">Started on {formatDate(activeJournal.last_updated)}</div> 
                             </div>
                        </div>

                        {posts.map((post) => (
                            // UPDATED: No grouping logic. Every message gets an avatar.
                            // UPDATED: Reduced vertical gap to mt-3
                            <div key={post.id} className="group flex gap-4 mt-3">
                                
                                {/* Always show Avatar */}
                                <UserAvatar username={post.username} className="w-10 h-10 mt-1 shrink-0" />
                                
                                <div className="flex-1 min-w-0">
                                    {/* Always show Header */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-white hover:underline cursor-pointer truncate">
                                            {post.username}
                                        </span>
                                        <span className="text-[10px] text-white/40 shrink-0">
                                            {formatDate(post.created_at)} at {formatTime(post.created_at)}
                                        </span>
                                        {post.username === activeJournal.username && (
                                            <span className="text-[9px] bg-accent text-black px-1 rounded font-bold uppercase shrink-0">OP</span>
                                        )}
                                    </div>
                                    
                                    <div className="text-white/90 leading-relaxed whitespace-pre-wrap mt-0.5 break-words">
                                        {post.content}
                                    </div>
                                    
                                    {/* Image Placeholder if url exists */}
                                    {post.image_url && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-md">
                                            <img src={post.image_url} alt="Attachment" className="w-full h-auto" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-black/20 border-t border-white/10 shrink-0">
                    <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-xl border border-white/10 focus-within:border-white/30 transition-colors">
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white h-10 w-10 shrink-0 rounded-lg">
                             <ImageIcon className="w-5 h-5" />
                        </Button>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendPost();
                                }
                            }}
                            placeholder={`Message #${activeJournal.title}`}
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 resize-none py-2 max-h-32 min-h-[40px]"
                            rows={1}
                        />
                        <Button 
                            onClick={sendPost} 
                            disabled={!newMessage.trim()}
                            className="bg-accent text-black hover:bg-white h-10 w-10 shrink-0 rounded-lg p-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </div>
        )}
      </main>
    </div>
  );
}