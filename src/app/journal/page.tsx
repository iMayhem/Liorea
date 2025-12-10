"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Image as ImageIcon, ArrowLeft, Upload, Loader2, Trash2, Smile, Star, Film, Search } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { db } from '@/lib/firebase';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { compressImage } from '@/lib/compress';
import { useSearchParams, useRouter } from 'next/navigation';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const GIPHY_API_KEY = "15K9ijqVrmDOKdieZofH1b6SFR7KuqG5";

// --- TYPES ---
type Reaction = { post_id: number; username: string; emoji: string; }
type Journal = { id: number; username: string; title: string; tags: string; theme_color: string; images?: string; last_updated: number; };
type Post = { id: number; username: string; content: string; image_url?: string; created_at: number; photoURL?: string; reactions?: Reaction[]; };
type GiphyResult = { id: string; images: { fixed_height: { url: string }; original: { url: string }; } }

const FormattedMessage = ({ content }: { content: string }) => {
    const parts = content.split(/(@\w+)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('@')) {
                    return <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-medium cursor-pointer hover:bg-indigo-500/50 transition-colors select-none mx-0.5">{part}</span>;
                }
                return part;
            })}
        </span>
    );
};

const QUICK_EMOJIS = ["🔥", "❤️", "👍", "😂", "😮", "😢", "🎉", "💯"];

function JournalContent() {
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [currentFollowers, setCurrentFollowers] = useState<string[]>([]);
  
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<number | null>(null);
  const [updatingJournalId, setUpdatingJournalId] = useState<number | null>(null);
  
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null); 
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [newMessage, setNewMessage] = useState("");
  const [isUploadingChatImage, setIsUploadingChatImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [openReactionPopoverId, setOpenReactionPopoverId] = useState<number | null>(null);

  const [gifs, setGifs] = useState<GiphyResult[]>([]);
  const [gifSearch, setGifSearch] = useState("");
  const [loadingGifs, setLoadingGifs] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
        if (username) {
            try {
                const fRes = await fetch(`${WORKER_URL}/journals/following?username=${username}`);
                if (fRes.ok) setFollowedIds(await fRes.json());
            } catch (e) {}
        }
        if (journals.length === 0) await fetchJournals();
        
        const targetId = searchParams.get('id');
        if (targetId) {
            const found = journals.find(j => j.id.toString() === targetId);
            if (!found) {
                 const res = await fetch(`${WORKER_URL}/journals/list`);
                 if(res.ok) {
                     const list: Journal[] = await res.json();
                     setJournals(list);
                     const freshFound = list.find(j => j.id.toString() === targetId);
                     if (freshFound) setActiveJournal(freshFound);
                 }
            } else { setActiveJournal(found); }
        }
    };
    init();
    const globalRef = ref(db, 'journal_global_signal/last_updated');
    const unsubscribe = onValue(globalRef, (snapshot) => { if (snapshot.exists()) fetchJournals(); });
    return () => unsubscribe();
  }, [searchParams, username]); 

  // --- CHAT LISTENER ---
  useEffect(() => {
    if (!activeJournal) return;
    fetchPosts(activeJournal.id);
    fetchFollowers(activeJournal.id);
    const signalRef = ref(db, `journal_signals/${activeJournal.id}`);
    const unsubscribe = onValue(signalRef, (snapshot) => { if (snapshot.exists()) fetchPosts(activeJournal.id); });
    return () => unsubscribe();
  }, [activeJournal]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" }); }, [posts]);

  // --- API FUNCTIONS ---
  const fetchGifs = async (query: string = "") => {
      setLoadingGifs(true);
      try {
          const endpoint = query ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=g` : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;
          const res = await fetch(endpoint);
          const data = await res.json();
          setGifs(data.data);
      } catch (error) { console.error("Failed to fetch GIFs", error); } finally { setLoadingGifs(false); }
  };

  const handleSendGif = async (url: string) => {
      if (!activeJournal || !username) return;
      const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() };
      setPosts([...posts, tempPost]); 
      try { await fetch(`${WORKER_URL}/journals/post`, { method: "POST", body: JSON.stringify({ journal_id: activeJournal.id, username, content: "", image_url: url }), headers: { "Content-Type": "application/json" } }); notifyChatUpdate(activeJournal.id); } catch (e) { console.error(e); }
  };

  const fetchJournals = async () => { try { const res = await fetch(`${WORKER_URL}/journals/list`); if(res.ok) setJournals(await res.json()); } catch (e) { console.error(e); } };
  const fetchPosts = async (id: number) => { try { const res = await fetch(`${WORKER_URL}/journals/posts?id=${id}`); if(res.ok) setPosts(await res.json()); } catch (e) { console.error(e); } };
  const fetchFollowers = async (id: number) => { try { const res = await fetch(`${WORKER_URL}/journals/followers?id=${id}`); if (res.ok) setCurrentFollowers(await res.json()); } catch (e) {} };

  // --- HELPERS ---
  const sortedJournals = useMemo(() => {
      return [...journals].sort((a, b) => {
          const aFollow = followedIds.includes(a.id) ? 1 : 0;
          const bFollow = followedIds.includes(b.id) ? 1 : 0;
          if (aFollow !== bFollow) return bFollow - aFollow; 
          return b.last_updated - a.last_updated; 
      });
  }, [journals, followedIds]);

  const handleFollowToggle = async () => {
      if (!activeJournal || !username) return;
      const isFollowing = followedIds.includes(activeJournal.id);
      if (isFollowing) { setFollowedIds(prev => prev.filter(id => id !== activeJournal.id)); setCurrentFollowers(prev => prev.filter(u => u !== username)); } 
      else { setFollowedIds(prev => [...prev, activeJournal.id]); setCurrentFollowers(prev => [username, ...prev]); }
      try { await fetch(`${WORKER_URL}/journals/follow`, { method: 'POST', body: JSON.stringify({ journal_id: activeJournal.id, username }), headers: { 'Content-Type': 'application/json' } }); } catch (e) { console.error(e); }
  };

  const handleReact = async (post_id: number, emoji: string) => {
      if (!username || !activeJournal) return;
      setOpenReactionPopoverId(null);
      setPosts(currentPosts => currentPosts.map(p => {
          if (p.id !== post_id) return p;
          const existingReactionIndex = p.reactions?.findIndex(r => r.username === username && r.emoji === emoji);
          let newReactions = p.reactions ? [...p.reactions] : [];
          if (existingReactionIndex !== undefined && existingReactionIndex > -1) { newReactions.splice(existingReactionIndex, 1); } else { newReactions.push({ post_id, username, emoji }); }
          return { ...p, reactions: newReactions };
      }));
      try { await fetch(`${WORKER_URL}/journals/react`, { method: 'POST', body: JSON.stringify({ post_id, username, emoji }), headers: { 'Content-Type': 'application/json' } }); notifyChatUpdate(activeJournal.id); } catch (e) { console.error("Reaction failed"); }
  };

  const getReactionGroups = (reactions: Reaction[] | undefined) => {
      if (!reactions) return {};
      const groups: Record<string, { count: number, hasReacted: boolean }> = {};
      reactions.forEach(r => {
          if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false };
          groups[r.emoji].count++;
          if (r.username === username) groups[r.emoji].hasReacted = true;
      });
      return groups;
  };

  const mentionableUsers = useMemo(() => { if (!mentionQuery) return []; const chatUsers = posts.map(p => p.username); const lbUsers = leaderboardUsers.map(u => u.username); const allUsers = Array.from(new Set([...chatUsers, ...lbUsers])); return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5); }, [mentionQuery, posts, leaderboardUsers]);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const val = e.target.value; setNewMessage(val); const cursorPos = e.target.selectionStart; const textBeforeCursor = val.slice(0, cursorPos); const match = textBeforeCursor.match(/@(\w*)$/); if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); } };
  const insertMention = (user: string) => { if (!mentionQuery) return; const cursorPos = chatInputRef.current?.selectionStart || 0; const textBefore = newMessage.slice(0, cursorPos).replace(/@(\w*)$/, `@${user} `); const textAfter = newMessage.slice(cursorPos); setNewMessage(textBefore + textAfter); setMentionQuery(null); chatInputRef.current?.focus(); };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (mentionQuery && mentionableUsers.length > 0) { if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1)); } else if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0)); } else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionableUsers[mentionIndex]); } else if (e.key === 'Escape') { setMentionQuery(null); } return; } if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); } };
  const handleOpenJournal = (journal: Journal) => { router.push(`/journal?id=${journal.id}`); };
  const notifyGlobalUpdate = () => set(ref(db, 'journal_global_signal/last_updated'), serverTimestamp());
  const notifyChatUpdate = (journalId: number) => set(ref(db, `journal_signals/${journalId}`), serverTimestamp());
  const handleDeleteJournal = async () => { if (!journalToDelete || !username) return; try { const res = await fetch(`${WORKER_URL}/journals/delete`, { method: 'DELETE', body: JSON.stringify({ id: journalToDelete, username }), headers: { 'Content-Type': 'application/json' } }); if (res.ok) { toast({ title: "Deleted" }); setJournalToDelete(null); if (activeJournal?.id === journalToDelete) router.push('/journal'); notifyGlobalUpdate(); } } catch (e) { console.error(e); } };
  const handleDeletePost = async (postId: number) => { if (!username) return; setPosts(posts.filter(p => p.id !== postId)); try { await fetch(`${WORKER_URL}/journals/post/delete`, { method: 'DELETE', body: JSON.stringify({ id: postId, username }), headers: { 'Content-Type': 'application/json' } }); if (activeJournal) notifyChatUpdate(activeJournal.id); } catch (e) { if(activeJournal) fetchPosts(activeJournal.id); } };
  const handleCardUploadClick = (journalId: number, e: React.MouseEvent) => { e.stopPropagation(); setUpdatingJournalId(journalId); cardFileInputRef.current?.click(); };
  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || !updatingJournalId || !username) return; const files = Array.from(e.target.files); if(files.length > 4) { toast({ variant: "destructive", title: "Limit" }); return; } toast({ title: "Uploading..." }); try { const urls: string[] = []; for (const file of files) { const compressed = await compressImage(file); const res = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: compressed }); if (res.ok) urls.push((await res.json()).url); } const updateRes = await fetch(`${WORKER_URL}/journals/update_images`, { method: 'POST', body: JSON.stringify({ id: updatingJournalId, images: urls.join(","), username }), headers: { 'Content-Type': 'application/json' } }); if (updateRes.ok) notifyGlobalUpdate(); } catch (error) { toast({ variant: "destructive", title: "Error" }); } finally { setUpdatingJournalId(null); if (cardFileInputRef.current) cardFileInputRef.current.value = ""; } };
  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || !e.target.files[0] || !activeJournal || !username) return; setIsUploadingChatImage(true); try { const compressed = await compressImage(e.target.files[0]); const uploadRes = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: compressed }); if (!uploadRes.ok) throw new Error("Upload failed"); const { url } = await uploadRes.json(); const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() }; setPosts([...posts, tempPost]); await fetch(`${WORKER_URL}/journals/post`, { method: "POST", body: JSON.stringify({ journal_id: activeJournal.id, username, content: "", image_url: url }), headers: { "Content-Type": "application/json" } }); notifyChatUpdate(activeJournal.id); } catch (error) { toast({ variant: "destructive", title: "Error" }); } finally { setIsUploadingChatImage(false); if (chatFileInputRef.current) chatFileInputRef.current.value = ""; } };
  const createJournal = async () => { if (!newTitle.trim() || !username) return; try { await fetch(`${WORKER_URL}/journals/create`, { method: "POST", body: JSON.stringify({ username, title: newTitle, tags: newTags, images: "", theme: "bg-black" }), headers: { "Content-Type": "application/json" } }); setNewTitle(""); setNewTags(""); setIsDialogOpen(false); notifyGlobalUpdate(); } catch (e) { console.error(e); } };
  const sendPost = async () => { if (!newMessage.trim() || !activeJournal || !username) return; const tempPost = { id: Date.now(), username, content: newMessage, created_at: Date.now() }; setPosts([...posts, tempPost]); setNewMessage(""); const mentions = tempPost.content.match(/@(\w+)/g); if (mentions) { const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1)))); uniqueUsers.forEach(taggedUser => { if (taggedUser !== username) { addNotification( `${username} mentioned you in "${activeJournal.title}"`, taggedUser, `/journal?id=${activeJournal.id}` ); } }); } try { await fetch(`${WORKER_URL}/journals/post`, { method: "POST", body: JSON.stringify({ journal_id: activeJournal.id, username, content: tempPost.content }), headers: { "Content-Type": "application/json" } }); notifyChatUpdate(activeJournal.id); } catch (e) { console.error(e); } };
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* 1. APP-LIKE HEADER (Fixed top) */}
      <div className="z-50">
        <Header />
      </div>
      
      {/* Hidden inputs */}
      <input type="file" ref={cardFileInputRef} className="hidden" accept="image/*" multiple onChange={handleCardFileChange} />
      <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileChange} />
      
      {/* 2. MAIN APP BODY (Below Header, Full remaining height) */}
      <main className="flex-1 flex overflow-hidden pt-16">
        
        {/* LEFT SIDEBAR: Journal List (Fixed Width or Responsive) */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-white/5 bg-[#111113] ${activeJournal ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Sidebar Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                <span className="font-bold text-white tracking-tight flex items-center gap-2 text-lg">
                    <Hash className="w-5 h-5 text-indigo-400" /> Journals
                </span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10"><Plus className="w-5 h-5" /></Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1e1e24] border-white/10 text-white">
                        <DialogHeader><DialogTitle>Create Journal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Journal Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/10 text-white" />
                            <Input placeholder="Tags (e.g. NEET)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/10 text-white" />
                            <Button onClick={createJournal} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Scrollable Journal List */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {sortedJournals.map((journal) => (
                        <div 
                            key={journal.id}
                            onClick={() => handleOpenJournal(journal)}
                            className={`group relative flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all
                                ${activeJournal?.id === journal.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
                            `}
                        >
                            {/* Tiny Cover Preview */}
                            <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-black/40 border border-white/5">
                                {journal.images ? <img src={journal.images.split(',')[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500/20" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold truncate text-sm">{journal.title}</span>
                                    {followedIds.includes(journal.id) && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                </div>
                                <div className="text-xs truncate opacity-60">@{journal.username}</div>
                            </div>

                            {/* Owner Actions (Hover) */}
                            {journal.username === username && (
                                <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111113] pl-2">
                                    <button onClick={(e) => handleCardUploadClick(journal.id, e)} className="p-1 hover:text-white"><Upload className="w-3 h-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setJournalToDelete(journal.id); }} className="p-1 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* RIGHT MAIN PANEL: Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#0a0a0a]/90 backdrop-blur-md relative ${!activeJournal ? 'hidden md:flex' : 'flex'}`}>
            
            {activeJournal ? (
                <>
                    {/* Chat Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 h-8 w-8" onClick={() => router.push('/journal')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Hash className="w-5 h-5 text-white/30" />
                            <div>
                                <h3 className="font-bold text-white text-base leading-tight">{activeJournal.title}</h3>
                                <p className="text-xs text-white/40">by {activeJournal.username}</p>
                            </div>
                        </div>
                        
                        {/* Header Actions */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 mr-2">
                                {currentFollowers.map((u, i) => <UserAvatar key={i} username={u} className="w-6 h-6 border-2 border-[#0a0a0a]" />)}
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-yellow-500" onClick={handleFollowToggle}>
                                <Star className={`w-5 h-5 ${followedIds.includes(activeJournal.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="flex-1">
                        <div className="p-4 pb-4 flex flex-col justify-end min-h-full">
                            {/* Empty State / Welcome */}
                            <div className="mt-auto mb-8 px-4">
                                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Hash className="w-8 h-8 text-white/20" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{activeJournal.title}</h1>
                                <p className="text-white/50">This is the start of the journal created by <span className="font-semibold text-white">@{activeJournal.username}</span>.</p>
                            </div>

                            {posts.map((post, index) => {
                                const isSequence = index > 0 && posts[index - 1].username === post.username;
                                const timeDiff = index > 0 ? post.created_at - posts[index - 1].created_at : 0;
                                const showHeader = !isSequence || timeDiff > 600000; 
                                const reactionGroups = getReactionGroups(post.reactions);

                                return (
                                    <div 
                                        key={post.id} 
                                        className={`group flex gap-4 pr-4 hover:bg-white/[0.02] -mx-4 px-4 transition-colors relative ${showHeader ? 'mt-6' : 'mt-0.5 py-0.5'}`}
                                    >
                                        <div className="w-10 shrink-0 select-none pt-0.5">
                                            {showHeader ? (
                                                <UserAvatar username={post.username} className="w-10 h-10 hover:opacity-90 cursor-pointer" />
                                            ) : (
                                                <div className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 text-right w-full pr-2 pt-1 select-none">
                                                    {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            {showHeader && (
                                                <div className="flex items-center gap-2 mb-1 select-none">
                                                    <span className="text-base font-semibold text-white hover:underline cursor-pointer">{post.username}</span>
                                                    <span className="text-xs text-white/30 ml-1">{formatDate(post.created_at)} at {formatTime(post.created_at)}</span>
                                                    {post.username === activeJournal.username && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase ml-1">OP</span>}
                                                </div>
                                            )}
                                            
                                            <div className="text-base text-zinc-100 leading-[1.375rem] whitespace-pre-wrap break-words font-light tracking-wide">
                                                <FormattedMessage content={post.content} />
                                            </div>
                                            
                                            {post.image_url && (
                                                <div className="mt-2 select-none">
                                                    <img src={post.image_url} alt="Attachment" className="max-h-[350px] max-w-full rounded-lg border border-white/10" loading="lazy" />
                                                </div>
                                            )}
                                            
                                            {/* Reactions */}
                                            {Object.keys(reactionGroups).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2 select-none">
                                                    {Object.entries(reactionGroups).map(([emoji, data]) => (
                                                        <button 
                                                            key={emoji} 
                                                            onClick={() => handleReact(post.id, emoji)} 
                                                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border transition-colors ${data.hasReacted ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-[#2b2d31] border-transparent hover:border-white/20'}`}
                                                        >
                                                            <span className="text-base">{emoji}</span>
                                                            <span className={`text-xs font-bold ${data.hasReacted ? 'text-indigo-200' : 'text-zinc-300'}`}>{data.count}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* HOVER TOOLBAR (Discord Style) */}
                                        <div className="absolute right-4 -top-2 bg-[#111113] shadow-sm rounded-[4px] border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center p-0.5 z-10">
                                            <Popover open={openReactionPopoverId === post.id} onOpenChange={(open) => setOpenReactionPopoverId(open ? post.id : null)}>
                                                <PopoverTrigger asChild>
                                                    <button className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                                                        <Smile className="w-4 h-4" />
                                                    </button>
                                                </PopoverTrigger>
                                                {/* FIXED POPUP: Darker, Floating */}
                                                <PopoverContent className="w-auto p-1.5 bg-[#18181b] border border-white/10 rounded-lg shadow-xl" side="top" align="end" sideOffset={5}>
                                                    <div className="flex gap-1">
                                                        {QUICK_EMOJIS.map(emoji => (
                                                            <button key={emoji} className="p-2 hover:bg-white/10 rounded-md text-xl transition-colors" onClick={() => handleReact(post.id, emoji)}>{emoji}</button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {post.username === username && (
                                                <button onClick={() => handleDeletePost(post.id)} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="px-4 pb-6 pt-2 bg-transparent shrink-0">
                        <div className="relative flex items-end gap-2 bg-[#1e1f22] p-2.5 rounded-lg text-zinc-200">
                            
                            {/* Attachments */}
                            <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" disabled={isUploadingChatImage} onClick={() => chatFileInputRef.current?.click()} className="text-zinc-400 hover:text-zinc-200 h-8 w-8 rounded-full hover:bg-transparent">
                                     {isUploadingChatImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="bg-zinc-400 w-5 h-5 rounded-full flex items-center justify-center text-[#1e1f22] font-bold text-xs"><Plus className="w-4 h-4" /></div>}
                                </Button>
                            </div>

                            {/* Text Area */}
                            <textarea 
                                ref={chatInputRef} 
                                value={newMessage} 
                                onChange={handleInputChange} 
                                onKeyDown={handleKeyDown} 
                                placeholder={`Message #${activeJournal.title}`} 
                                className="w-full bg-transparent border-none focus:ring-0 text-base placeholder:text-zinc-500 resize-none py-1 max-h-48 min-h-[24px]" 
                                rows={1} 
                            />
                            
                            {/* Right Actions */}
                            <div className="flex gap-2 shrink-0">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200 h-8 w-8 rounded hover:bg-transparent"><Film className="w-5 h-5" /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="end" className="w-80 p-2 bg-[#1e1e24] border-white/10 text-white">
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2 w-4 h-4 text-white/40" />
                                                <Input placeholder="Search GIFs..." className="h-8 pl-8 bg-black/20 border-white/10 text-sm" value={gifSearch} onChange={(e) => { setGifSearch(e.target.value); fetchGifs(e.target.value); }} />
                                            </div>
                                            <div className="h-60 overflow-y-auto no-scrollbar grid grid-cols-2 gap-1">
                                                {loadingGifs ? <div className="col-span-2 text-center py-4 text-xs text-white/40">Loading...</div> : gifs.map(gif => (
                                                    <img key={gif.id} src={gif.images.fixed_height.url} className="w-full h-auto object-cover rounded cursor-pointer hover:opacity-80" onClick={() => handleSendGif(gif.images.original.url)} />
                                                ))}
                                            </div>
                                        </div>
                                        <div ref={(el) => { if(el && gifs.length === 0) fetchGifs(); }} />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200 h-8 w-8 rounded hover:bg-transparent"><Smile className="w-6 h-6" /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="end" className="w-auto p-0 border-none bg-transparent shadow-none">
                                        <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} height={400} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        {mentionQuery && mentionableUsers.length > 0 && (
                            <div className="absolute bottom-20 left-4 bg-[#1e1e24] border border-black/50 rounded-md shadow-2xl overflow-hidden w-64 z-50 select-none">
                                <div className="px-3 py-2 text-xs uppercase font-bold text-zinc-500 tracking-wider bg-[#111113]">Members</div>
                                {mentionableUsers.map((u, i) => (
                                    <div key={u} className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${i === mentionIndex ? 'bg-[#404249] text-white' : 'text-zinc-400 hover:bg-[#35373c]'}`} onClick={() => insertMention(u)}>
                                        <UserAvatar username={u} className="w-6 h-6" /><span className="text-sm font-medium">{u}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/10 select-none">
                    <Hash className="w-20 h-20 mb-6 opacity-20" />
                    <p className="text-lg font-medium text-zinc-500">Select a journal to start reading</p>
                </div>
            )}
        </div>

        <AlertDialog open={!!journalToDelete} onOpenChange={() => setJournalToDelete(null)}>
            <AlertDialogContent className="bg-[#1e1e24] border-black/50 text-white">
                <AlertDialogHeader><AlertDialogTitle>Delete Journal?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteJournal} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

// SUSPENSE WRAPPER
export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading...</div>}>
            <JournalContent />
        </Suspense>
    </div>
  );
}