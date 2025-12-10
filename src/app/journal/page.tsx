"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'; // Added Suspense import
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { useNotifications } from '@/context/NotificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft, Upload, Loader2, Trash2 } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { compressImage } from '@/lib/compress';
import { useSearchParams, useRouter } from 'next/navigation';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

// --- TYPES ---
type Journal = {
  id: number;
  username: string;
  title: string;
  tags: string;
  theme_color: string;
  images?: string; 
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

// --- HELPER COMPONENT ---
const FormattedMessage = ({ content }: { content: string }) => {
    const parts = content.split(/(@\w+)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('@')) {
                    return (
                        <span key={i} className="inline-flex items-center px-1 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-medium cursor-pointer hover:bg-indigo-500/50 transition-colors">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
};

// --- MAIN CONTENT COMPONENT (Contains useSearchParams logic) ---
function JournalContent() {
  const { username, leaderboardUsers } = usePresence();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  const [view, setView] = useState<'gallery' | 'chat'>('gallery');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
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

  // 1. INITIAL LOAD & URL SYNC
  useEffect(() => {
    const init = async () => {
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
                     if (freshFound) { setActiveJournal(freshFound); setView('chat'); }
                 }
            } else {
                setActiveJournal(found); setView('chat');
            }
        } else {
            setActiveJournal(null); setView('gallery');
        }
    };
    init();

    const globalRef = ref(db, 'journal_global_signal/last_updated');
    const unsubscribe = onValue(globalRef, (snapshot) => {
        if (snapshot.exists()) fetchJournals();
    });
    return () => unsubscribe();
  }, [searchParams]); 

  // 2. CHAT LISTENER
  useEffect(() => {
    if (!activeJournal) return;
    fetchPosts(activeJournal.id);
    const signalRef = ref(db, `journal_signals/${activeJournal.id}`);
    const unsubscribe = onValue(signalRef, (snapshot) => {
        if (snapshot.exists()) fetchPosts(activeJournal.id);
    });
    return () => unsubscribe();
  }, [activeJournal]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  // --- DATA FETCHING ---
  const fetchJournals = async () => {
    try {
        const res = await fetch(`${WORKER_URL}/journals/list`);
        if(res.ok) setJournals(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchPosts = async (id: number) => {
    try {
        const res = await fetch(`${WORKER_URL}/journals/posts?id=${id}`);
        if(res.ok) setPosts(await res.json());
    } catch (e) { console.error(e); }
  };

  // --- MENTION LOGIC ---
  const mentionableUsers = useMemo(() => {
      if (!mentionQuery) return [];
      const chatUsers = posts.map(p => p.username);
      const lbUsers = leaderboardUsers.map(u => u.username);
      const allUsers = Array.from(new Set([...chatUsers, ...lbUsers]));
      return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5);
  }, [mentionQuery, posts, leaderboardUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setNewMessage(val);
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = val.slice(0, cursorPos);
      const match = textBeforeCursor.match(/@(\w*)$/); 
      if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); }
  };

  const insertMention = (user: string) => {
      if (!mentionQuery) return;
      const cursorPos = chatInputRef.current?.selectionStart || 0;
      const textBefore = newMessage.slice(0, cursorPos).replace(/@(\w*)$/, `@${user} `);
      const textAfter = newMessage.slice(cursorPos);
      setNewMessage(textBefore + textAfter);
      setMentionQuery(null);
      chatInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionQuery && mentionableUsers.length > 0) {
          if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1)); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0)); }
          else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionableUsers[mentionIndex]); }
          else if (e.key === 'Escape') { setMentionQuery(null); }
          return;
      }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); }
  };

  // --- ACTIONS ---
  const handleOpenJournal = (journal: Journal) => { router.push(`/journal?id=${journal.id}`); };
  const handleBackToGallery = () => { router.push('/journal'); };
  const notifyGlobalUpdate = () => set(ref(db, 'journal_global_signal/last_updated'), serverTimestamp());
  const notifyChatUpdate = (journalId: number) => set(ref(db, `journal_signals/${journalId}`), serverTimestamp());

  const handleDeleteJournal = async () => {
      if (!journalToDelete || !username) return;
      try {
          const res = await fetch(`${WORKER_URL}/journals/delete`, { method: 'DELETE', body: JSON.stringify({ id: journalToDelete, username }), headers: { 'Content-Type': 'application/json' } });
          if (res.ok) { 
              toast({ title: "Deleted" }); setJournalToDelete(null); 
              if (activeJournal?.id === journalToDelete) router.push('/journal');
              notifyGlobalUpdate(); 
          }
      } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (postId: number) => {
      if (!username) return;
      setPosts(posts.filter(p => p.id !== postId));
      try {
          await fetch(`${WORKER_URL}/journals/post/delete`, { method: 'DELETE', body: JSON.stringify({ id: postId, username }), headers: { 'Content-Type': 'application/json' } });
          if (activeJournal) notifyChatUpdate(activeJournal.id);
      } catch (e) { if(activeJournal) fetchPosts(activeJournal.id); }
  };

  const handleCardUploadClick = (journalId: number, e: React.MouseEvent) => {
      e.stopPropagation(); setUpdatingJournalId(journalId); cardFileInputRef.current?.click();
  };

  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !updatingJournalId || !username) return;
      const files = Array.from(e.target.files);
      if(files.length > 4) { toast({ variant: "destructive", title: "Limit" }); return; }
      toast({ title: "Uploading..." });
      try {
          const urls: string[] = [];
          for (const file of files) {
              const compressed = await compressImage(file);
              const res = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: compressed });
              if (res.ok) urls.push((await res.json()).url);
          }
          const updateRes = await fetch(`${WORKER_URL}/journals/update_images`, { method: 'POST', body: JSON.stringify({ id: updatingJournalId, images: urls.join(","), username }), headers: { 'Content-Type': 'application/json' } });
          if (updateRes.ok) notifyGlobalUpdate();
      } catch (error) { toast({ variant: "destructive", title: "Error" }); } 
      finally { setUpdatingJournalId(null); if (cardFileInputRef.current) cardFileInputRef.current.value = ""; }
  };

  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0] || !activeJournal || !username) return;
      setIsUploadingChatImage(true);
      try {
          const compressed = await compressImage(e.target.files[0]);
          const uploadRes = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: compressed });
          if (!uploadRes.ok) throw new Error("Upload failed");
          const { url } = await uploadRes.json();
          const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() };
          setPosts([...posts, tempPost]); 
          await fetch(`${WORKER_URL}/journals/post`, { method: "POST", body: JSON.stringify({ journal_id: activeJournal.id, username, content: "", image_url: url }), headers: { "Content-Type": "application/json" } });
          notifyChatUpdate(activeJournal.id);
      } catch (error) { toast({ variant: "destructive", title: "Error" }); } 
      finally { setIsUploadingChatImage(false); if (chatFileInputRef.current) chatFileInputRef.current.value = ""; }
  };

  const createJournal = async () => {
      if (!newTitle.trim() || !username) return;
      try {
          await fetch(`${WORKER_URL}/journals/create`, { method: "POST", body: JSON.stringify({ username, title: newTitle, tags: newTags, images: "", theme: "bg-black" }), headers: { "Content-Type": "application/json" } });
          setNewTitle(""); setNewTags(""); setIsDialogOpen(false); notifyGlobalUpdate();
      } catch (e) { console.error(e); }
  };

  const sendPost = async () => {
    if (!newMessage.trim() || !activeJournal || !username) return;
    const tempPost = { id: Date.now(), username, content: newMessage, created_at: Date.now() };
    setPosts([...posts, tempPost]);
    setNewMessage("");

    const mentions = tempPost.content.match(/@(\w+)/g);
    if (mentions) {
        const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1)))); 
        uniqueUsers.forEach(taggedUser => {
            if (taggedUser !== username) {
                addNotification(
                    `${username} mentioned you in "${activeJournal.title}"`, 
                    taggedUser,
                    `/journal?id=${activeJournal.id}` 
                );
            }
        });
    }

    try {
        await fetch(`${WORKER_URL}/journals/post`, { method: "POST", body: JSON.stringify({ journal_id: activeJournal.id, username, content: tempPost.content }), headers: { "Content-Type": "application/json" } });
        notifyChatUpdate(activeJournal.id);
    } catch (e) { console.error(e); }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const JournalCollage = ({ imagesStr }: { imagesStr?: string }) => {
      const images = imagesStr ? imagesStr.split(',').filter(Boolean) : [];
      if (images.length === 0) return <div className="w-full h-full bg-black/40" />;
      return (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
              <div className={`relative ${images.length === 1 ? 'col-span-2 row-span-2' : ''} ${images.length === 3 ? 'row-span-2' : ''} overflow-hidden border-r border-b border-black/10`}>
                  <img src={images[0]} className="w-full h-full object-cover" alt="cover" loading="lazy" />
              </div>
              {images.length >= 2 && <div className={`relative ${images.length === 2 ? 'row-span-2' : ''} overflow-hidden border-b border-black/10`}><img src={images[1]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>}
              {images.length >= 3 && <div className={`relative ${images.length === 3 ? 'col-start-2' : ''} overflow-hidden border-r border-black/10`}><img src={images[2]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>}
              {images.length >= 4 && <div className="relative overflow-hidden"><img src={images[3]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>}
          </div>
      );
  };

  return (
      <>
      <Header />
      <input type="file" ref={cardFileInputRef} className="hidden" accept="image/*" multiple onChange={handleCardFileChange} />
      <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileChange} />
      
      <main className="container mx-auto pt-20 px-4 h-screen flex gap-6 pb-4">
        
        {/* LEFT: JOURNAL LIST */}
        <div className={`flex-shrink-0 w-full md:w-[38%] lg:w-[35%] flex flex-col ${activeJournal ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex justify-end items-center mb-4 shrink-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button size="sm" variant="secondary" className="h-8 shadow-md"><Plus className="w-4 h-4 mr-1" /> New Journal</Button></DialogTrigger>
                    <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                        <DialogHeader><DialogTitle>Create Journal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Journal Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Input placeholder="Tags (e.g. NEET)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Button onClick={createJournal} className="w-full bg-accent text-black hover:bg-white">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {journals.map((journal) => (
                        <Card key={journal.id} onClick={() => handleOpenJournal(journal)} className={`relative group cursor-pointer h-40 xl:h-48 bg-black/20 backdrop-blur-md border hover:border-white/30 transition-all overflow-hidden shadow-lg rounded-xl ${activeJournal?.id === journal.id ? 'border-accent/50 ring-1 ring-accent/20' : 'border-white/10'}`}>
                            <div className="absolute inset-0 z-0"><JournalCollage imagesStr={journal.images} /></div>
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                            {journal.username === username && (
                                <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-black/50 hover:bg-white text-white hover:text-black" onClick={(e) => handleCardUploadClick(journal.id, e)}><Upload className="w-3 h-3" /></Button>
                                    <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full bg-red-500/50 hover:bg-red-500" onClick={(e) => { e.stopPropagation(); setJournalToDelete(journal.id); }}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            )}
                            <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
                                <div className="flex items-center gap-2 mb-1"><UserAvatar username={journal.username} className="h-6 w-6 border border-white/20" /><span className="text-[10px] text-white/60 truncate">@{journal.username}</span></div>
                                <h3 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{journal.title}</h3>
                                <div className="flex gap-1 flex-wrap">{journal.tags && journal.tags.split(',').slice(0, 1).map((tag, i) => (<span key={i} className="text-[9px] bg-white/10 px-1.5 rounded text-white/70">{tag}</span>))}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT: CHAT */}
        <div className={`flex-1 flex flex-col bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden ${!activeJournal ? 'hidden md:flex' : 'flex'}`}>
            {activeJournal ? (
                <>
                    <div className="h-12 border-b border-white/10 flex items-center px-4 bg-black/10 shrink-0 justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Button variant="ghost" size="icon" className="md:hidden mr-1 -ml-2 h-8 w-8" onClick={handleBackToGallery}><ArrowLeft className="w-4 h-4" /></Button>
                            <span className="font-bold text-white truncate text-sm"># {activeJournal.title}</span>
                            <span className="text-[10px] text-white/40 truncate hidden sm:inline">by {activeJournal.username}</span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-3">
                        <div className="space-y-1 pb-2">
                            <div className="text-center py-6"><div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 mb-2"><Hash className="w-5 h-5 text-white/20" /></div><p className="text-xs text-white/30">Start of history</p></div>
                            {posts.map((post, index) => {
                                const isSequence = index > 0 && posts[index - 1].username === post.username;
                                return (
                                    <div key={post.id} className={`group flex gap-3 px-2 hover:bg-white/5 transition-colors relative ${isSequence ? 'mt-0.5 py-0.5' : 'mt-4 py-1'}`}>
                                        <div className="w-8 shrink-0">{!isSequence ? (<UserAvatar username={post.username} className="w-8 h-8 mt-0.5" />) : (<div className="w-8" />)}</div>
                                        <div className="flex-1 min-w-0">
                                            {!isSequence && (
                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                    <span className="text-sm font-bold text-white hover:underline cursor-pointer">{post.username}</span>
                                                    <span className="text-[10px] text-white/30">{formatDate(post.created_at)} at {formatTime(post.created_at)}</span>
                                                    {post.username === activeJournal.username && <span className="text-[9px] bg-accent text-black px-1 rounded font-bold uppercase shrink-0">OP</span>}
                                                </div>
                                            )}
                                            <div className="text-sm text-white/90 leading-snug whitespace-pre-wrap break-words">
                                                <FormattedMessage content={post.content} />
                                            </div>
                                            {post.image_url && (<div className="mt-1.5"><img src={post.image_url} alt="Attachment" className="max-h-60 w-auto object-contain rounded-md border border-white/10" loading="lazy" /></div>)}
                                        </div>
                                        {post.username === username && (<button onClick={() => handleDeletePost(post.id)} className="absolute right-2 top-1 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"><Trash2 className="w-3 h-3" /></button>)}
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* MENTION DROPUP */}
                    {mentionQuery && mentionableUsers.length > 0 && (
                        <div className="absolute bottom-16 left-4 bg-[#1e1e24] border border-white/10 rounded-lg shadow-2xl overflow-hidden w-64 z-50">
                            <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/40 tracking-wider bg-white/5">Members</div>
                            {mentionableUsers.map((u, i) => (
                                <div key={u} className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${i === mentionIndex ? 'bg-indigo-500/20 text-white' : 'text-white/70 hover:bg-white/5'}`} onClick={() => insertMention(u)}>
                                    <UserAvatar username={u} className="w-6 h-6" /><span className="text-sm">{u}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-3 bg-black/10 border-t border-white/5 shrink-0">
                        <div className="relative flex items-end gap-2 bg-white/5 p-1.5 rounded-lg border border-white/10 focus-within:border-white/20 transition-colors">
                            <Button variant="ghost" size="icon" disabled={isUploadingChatImage} onClick={() => chatFileInputRef.current?.click()} className="text-white/40 hover:text-white h-8 w-8 shrink-0 rounded">{isUploadingChatImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}</Button>
                            <textarea ref={chatInputRef} value={newMessage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={`Message #${activeJournal.title}`} className="w-full bg-transparent border-none focus:ring-0 text-white text-sm placeholder:text-white/20 resize-none py-1.5 max-h-24 min-h-[32px]" rows={1} />
                            <Button onClick={sendPost} disabled={!newMessage.trim()} className="bg-white/10 hover:bg-white text-white hover:text-black h-8 w-8 shrink-0 rounded p-0"><Send className="w-3 h-3" /></Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/20"><Hash className="w-16 h-16 mb-4 opacity-20" /><p className="text-sm">Select a journal to start reading</p></div>
            )}
        </div>

        <AlertDialog open={!!journalToDelete} onOpenChange={() => setJournalToDelete(null)}>
            <AlertDialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                <AlertDialogHeader><AlertDialogTitle>Delete Journal?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteJournal} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </main>
      </>
  );
}

// --- SUSPENSE WRAPPER ---
export default function JournalPage() {
  return (
    <div className="min-h-screen text-white bg-transparent overflow-hidden">
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-white/50">Loading...</div>}>
            <JournalContent />
        </Suspense>
    </div>
  );
}