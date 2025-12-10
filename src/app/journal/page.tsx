"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/context/PresenceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft, Upload, Loader2, Trash2, X } from 'lucide-react';
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

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

// Types
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

export default function JournalPage() {
  const { username } = usePresence();
  const { toast } = useToast();
  
  const [view, setView] = useState<'gallery' | 'chat'>('gallery');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Creation State
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Update/Delete State
  const [journalToDelete, setJournalToDelete] = useState<number | null>(null);
  const [updatingJournalId, setUpdatingJournalId] = useState<number | null>(null);
  
  // Refs for File Inputs
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null); // NEW: For Chat Images
  
  // Posting State
  const [newMessage, setNewMessage] = useState("");
  const [isUploadingChatImage, setIsUploadingChatImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchJournals(); }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'chat' && activeJournal) {
        fetchPosts(activeJournal.id);
        interval = setInterval(() => fetchPosts(activeJournal.id), 5000);
    }
    return () => clearInterval(interval);
  }, [view, activeJournal]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

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

  // --- ACTIONS ---

  const handleDeleteJournal = async () => {
      if (!journalToDelete || !username) return;
      try {
          const res = await fetch(`${WORKER_URL}/journals/delete`, {
              method: 'DELETE',
              body: JSON.stringify({ id: journalToDelete, username }),
              headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
              toast({ title: "Deleted", description: "Journal deleted successfully." });
              setJournalToDelete(null);
              fetchJournals();
          } else {
              toast({ variant: "destructive", title: "Error", description: "Could not delete journal." });
          }
      } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (postId: number) => {
      if (!username) return;
      setPosts(posts.filter(p => p.id !== postId));
      try {
          await fetch(`${WORKER_URL}/journals/post/delete`, {
              method: 'DELETE',
              body: JSON.stringify({ id: postId, username }),
              headers: { 'Content-Type': 'application/json' }
          });
      } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete message." });
          if(activeJournal) fetchPosts(activeJournal.id);
      }
  };

  // --- CARD COVER UPLOAD ---
  const handleCardUploadClick = (journalId: number, e: React.MouseEvent) => {
      e.stopPropagation(); 
      setUpdatingJournalId(journalId);
      cardFileInputRef.current?.click();
  };

  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !updatingJournalId || !username) return;
      const files = Array.from(e.target.files);
      if(files.length > 4) {
          toast({ variant: "destructive", title: "Limit Exceeded", description: "Max 4 images allowed." });
          return;
      }
      toast({ title: "Uploading...", description: "Updating journal cover." });

      try {
          const urls: string[] = [];
          for (const file of files) {
              const res = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: file });
              if (res.ok) urls.push((await res.json()).url);
          }
          const imagesStr = urls.join(",");
          const updateRes = await fetch(`${WORKER_URL}/journals/update_images`, {
              method: 'POST',
              body: JSON.stringify({ id: updatingJournalId, images: imagesStr, username }),
              headers: { 'Content-Type': 'application/json' }
          });

          if (updateRes.ok) {
              toast({ title: "Success", description: "Cover updated." });
              fetchJournals(); 
          } 
      } catch (error) { toast({ variant: "destructive", title: "Error", description: "Upload failed." }); } 
      finally { setUpdatingJournalId(null); if (cardFileInputRef.current) cardFileInputRef.current.value = ""; }
  };

  // --- CHAT IMAGE UPLOAD (NEW) ---
  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0] || !activeJournal || !username) return;
      const file = e.target.files[0];
      
      setIsUploadingChatImage(true);
      toast({ title: "Uploading...", description: "Sending image..." });

      try {
          // 1. Upload to R2
          const uploadRes = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: file });
          if (!uploadRes.ok) throw new Error("Upload failed");
          const { url } = await uploadRes.json();

          // 2. Send Post with Image URL
          const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() };
          setPosts([...posts, tempPost]); // Optimistic update

          await fetch(`${WORKER_URL}/journals/post`, {
              method: "POST",
              body: JSON.stringify({ journal_id: activeJournal.id, username, content: "", image_url: url }),
              headers: { "Content-Type": "application/json" }
          });
          
          fetchPosts(activeJournal.id); // Sync
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to send image." });
      } finally {
          setIsUploadingChatImage(false);
          if (chatFileInputRef.current) chatFileInputRef.current.value = "";
      }
  };

  const createJournal = async () => {
    if (!newTitle.trim() || !username) return;
    try {
        await fetch(`${WORKER_URL}/journals/create`, {
            method: "POST",
            body: JSON.stringify({ username, title: newTitle, tags: newTags, images: "", theme: "bg-black" }),
            headers: { "Content-Type": "application/json" }
        });
        setNewTitle(""); setNewTags(""); setIsDialogOpen(false);
        fetchJournals();
    } catch (e) { console.error(e); }
  };

  const sendPost = async () => {
    if (!newMessage.trim() || !activeJournal || !username) return;
    const tempPost = { id: Date.now(), username, content: newMessage, created_at: Date.now() };
    setPosts([...posts, tempPost]);
    setNewMessage("");

    try {
        await fetch(`${WORKER_URL}/journals/post`, {
            method: "POST",
            body: JSON.stringify({ journal_id: activeJournal.id, username, content: tempPost.content }),
            headers: { "Content-Type": "application/json" }
        });
        fetchPosts(activeJournal.id);
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
                  <img src={images[0]} className="w-full h-full object-cover" alt="cover" />
              </div>
              {images.length >= 2 && (
                  <div className={`relative ${images.length === 2 ? 'row-span-2' : ''} overflow-hidden border-b border-black/10`}>
                      <img src={images[1]} className="w-full h-full object-cover" alt="cover" />
                  </div>
              )}
              {images.length >= 3 && (
                  <div className={`relative ${images.length === 3 ? 'col-start-2' : ''} overflow-hidden border-r border-black/10`}>
                      <img src={images[2]} className="w-full h-full object-cover" alt="cover" />
                  </div>
              )}
              {images.length >= 4 && (
                  <div className="relative overflow-hidden"><img src={images[3]} className="w-full h-full object-cover" alt="cover" /></div>
              )}
          </div>
      );
  };

  return (
    <div className="min-h-screen text-white bg-transparent">
      <Header />
      
      {/* Hidden File Inputs */}
      <input type="file" ref={cardFileInputRef} className="hidden" accept="image/*" multiple onChange={handleCardFileChange} />
      <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileChange} />
      
      <main className="container mx-auto pt-24 pb-10 px-4 h-screen flex flex-col">
        {/* GALLERY VIEW */}
        {view === 'gallery' && (
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Community Journals</h1>
                        <p className="text-white/50">Read about others' journeys or document your own.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-white/90"><Plus className="w-4 h-4 mr-2" /> New Journal</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                            <DialogHeader><DialogTitle>Create your Space</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2"><label className="text-sm text-white/70">Journal Title</label><Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/20 text-white" /></div>
                                <div className="space-y-2"><label className="text-sm text-white/70">Tags</label><Input placeholder="Tags" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/20 text-white" /></div>
                                <Button onClick={createJournal} className="w-full bg-accent text-black hover:bg-white">Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {journals.map((journal) => (
                        <Card key={journal.id} onClick={() => { setActiveJournal(journal); setView('chat'); }}
                            className="relative group cursor-pointer h-64 bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-lg hover:shadow-xl rounded-xl"
                        >
                            <div className="absolute inset-0 z-0"><JournalCollage imagesStr={journal.images} /></div>
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                            
                            {/* CONTROLS (Hover) */}
                            {journal.username === username && (
                                <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 hover:bg-white text-white hover:text-black border border-white/20"
                                        onClick={(e) => handleCardUploadClick(journal.id, e)}><Upload className="w-4 h-4" /></Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full bg-red-500/50 hover:bg-red-500 border border-white/20"
                                        onClick={(e) => { e.stopPropagation(); setJournalToDelete(journal.id); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
                                <div className="mb-3"><UserAvatar username={journal.username} className="h-14 w-14 rounded-xl border-2 border-white/20 shadow-xl text-xl" /></div>
                                <h3 className="text-xl font-bold text-white leading-tight mb-1 truncate">{journal.title}</h3>
                                <div className="flex justify-between items-end">
                                    <div className="flex gap-2 flex-wrap">
                                        {journal.tags && journal.tags.split(',').slice(0, 2).map((tag, i) => (
                                            <span key={i} className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/70 backdrop-blur-sm">{tag}</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-white/40 font-mono">@{journal.username} • {formatDate(journal.last_updated)}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* CHAT VIEW */}
        {view === 'chat' && activeJournal && (
            <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden h-[calc(100vh-120px)] animate-in fade-in zoom-in-95 duration-300">
                <div className="h-16 border-b border-white/10 flex items-center px-4 bg-black/20 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setView('gallery')} className="mr-2 text-white/50 hover:text-white"><ArrowLeft className="w-5 h-5" /></Button>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-black font-bold text-xs"><Hash className="w-4 h-4" /></div>
                        <div><h2 className="font-bold text-white leading-none">{activeJournal.title}</h2><p className="text-xs text-white/50 mt-1">Author: {activeJournal.username}</p></div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 pb-4">
                        
                        {/* COMPACT WELCOME HEADER */}
                        <div className="flex items-center gap-4 px-2 py-4 mb-4 border-b border-white/10">
                             <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center text-2xl shrink-0 text-black">
                                📚
                             </div>
                             <div>
                                <h3 className="text-lg font-bold">Welcome to {activeJournal.title}</h3>
                                <p className="text-white/50 text-xs">This is the start of {activeJournal.username}&apos;s journey. {formatDate(activeJournal.last_updated)}</p>
                             </div>
                        </div>

                        {posts.map((post) => (
                            <div key={post.id} className="group flex gap-4 mt-3 relative">
                                <UserAvatar username={post.username} className="w-10 h-10 mt-1 shrink-0" />
                                <div className="flex-1 min-w-0 pr-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-white hover:underline cursor-pointer truncate">{post.username}</span>
                                        <span className="text-[10px] text-white/40 shrink-0">{formatDate(post.created_at)} at {formatTime(post.created_at)}</span>
                                        {post.username === activeJournal.username && <span className="text-[9px] bg-accent text-black px-1 rounded font-bold uppercase shrink-0">OP</span>}
                                    </div>
                                    <div className="text-white/90 leading-relaxed whitespace-pre-wrap mt-0.5 break-words">{post.content}</div>
                                    {post.image_url && <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-md"><img src={post.image_url} alt="Attachment" className="w-full h-auto" /></div>}
                                </div>
                                {/* Delete Message Button */}
                                {post.username === username && (
                                    <button onClick={() => handleDeletePost(post.id)} className="absolute right-0 top-0 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 bg-black/20 border-t border-white/10 shrink-0">
                    <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-xl border border-white/10 focus-within:border-white/30 transition-colors">
                        {/* IMAGE UPLOAD BUTTON (WIRED UP) */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={isUploadingChatImage}
                            onClick={() => chatFileInputRef.current?.click()} // Triggers file input
                            className="text-white/50 hover:text-white h-10 w-10 shrink-0 rounded-lg"
                        >
                             {isUploadingChatImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        </Button>
                        
                        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); } }} placeholder={`Message #${activeJournal.title}`} className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 resize-none py-2 max-h-32 min-h-[40px]" rows={1} />
                        <Button onClick={sendPost} disabled={!newMessage.trim()} className="bg-accent text-black hover:bg-white h-10 w-10 shrink-0 rounded-lg p-0"><Send className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!journalToDelete} onOpenChange={() => setJournalToDelete(null)}>
            <AlertDialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Journal?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                        This will permanently delete this journal and all messages inside it. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJournal} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  );
}