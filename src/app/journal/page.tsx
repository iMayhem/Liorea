"use client";

import { useState, useEffect, useRef, useMemo, Suspense, useLayoutEffect } from 'react';
import Header from '@/components/layout/Header';
import { usePresence } from '@/features/study';
import { useNotifications } from '@/context/NotificationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash, Send, Image as ImageIcon, ArrowLeft, Upload, Loader2, Trash2, Smile, Star, Film, Search, ChevronDown, Flag } from 'lucide-react';
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
import { ref, onValue, set, serverTimestamp, push } from 'firebase/database';
import { compressImage } from '@/lib/compress';
import { useSearchParams, useRouter } from 'next/navigation';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { api } from '@/lib/api';

// ... (TYPES AND HELPERS REMAIN SAME AS BEFORE) ...

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
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoaded, setIsInitialLoaded] = useState(false);
    const prevScrollHeight = useRef(0);
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const prevPostsLength = useRef(0);
    const prevJournalId = useRef<number | null>(null);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [gifs, setGifs] = useState<GiphyResult[]>([]);
    const [gifSearch, setGifSearch] = useState("");
    const [loadingGifs, setLoadingGifs] = useState(false);
    const [openReactionPopoverId, setOpenReactionPopoverId] = useState<number | null>(null);

    // ... (API FUNCTIONS REMAIN SAME) ...
    const fetchJournals = async () => { try { const data = await api.journal.list(); setJournals(data); } catch (e) { console.error(e); } };
    const fetchPosts = async (id: number, before?: number, isUpdate = false) => {
        try {
            const newPosts: Post[] = await api.journal.getPosts(id, before);
            if (before) {
                if (newPosts.length < 20) setHasMore(false);
                if (newPosts.length > 0) setPosts(prev => [...newPosts, ...prev]);
                setLoadingMore(false);
            } else {
                if (isUpdate) {
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
                        if (uniqueNew.length === 0) return prev;
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setPosts(newPosts);
                    if (newPosts.length < 20) setHasMore(false);
                }
            }
        } catch (e) { console.error(e); setLoadingMore(false); }
    };
    const fetchFollowers = async (id: number) => { try { const data = await api.journal.getFollowers(id); setCurrentFollowers(data); } catch (e) { } };

    const handleReportMessage = async (msg: Post) => {
        if (!username || !activeJournal) return;
        try {
            await push(ref(db, 'reports'), {
                reporter: username,
                reported_user: msg.username,
                message_content: msg.content || "Image/GIF",
                message_id: msg.id,
                room: `Journal: ${activeJournal.title}`,
                timestamp: serverTimestamp(),
                status: "pending"
            });
            toast({ title: "Report Sent", description: "Admins have been notified." });
        } catch (e) { toast({ variant: "destructive", title: "Error", description: "Could not send report." }); }
    };

    // ... (USE EFFECTS REMAIN SAME) ...
    useEffect(() => {
        const init = async () => {
            if (username) { try { const data = await api.journal.getFollowing(username); setFollowedIds(data); } catch (e) { } }
            if (journals.length === 0) await fetchJournals();
            const targetId = searchParams.get('id');
            if (targetId) {
                const found = journals.find(j => j.id.toString() === targetId);
                if (!found) {
                    try { const list = await api.journal.list(); setJournals(list); const freshFound = list.find(j => j.id.toString() === targetId); if (freshFound) { setActiveJournal(freshFound); } } catch (e) { }
                } else { setActiveJournal(found); }
            } else { setActiveJournal(null); }
        };
        init();
        const globalRef = ref(db, 'journal_global_signal/last_updated');
        const unsubscribe = onValue(globalRef, (snapshot) => { if (snapshot.exists()) fetchJournals(); });
        return () => unsubscribe();
    }, [searchParams, username]);

    useEffect(() => {
        if (!activeJournal) return;
        setPosts([]); setHasMore(true); setIsInitialLoaded(false); setLoadingMore(false);
        fetchPosts(activeJournal.id); fetchFollowers(activeJournal.id);
        const signalRef = ref(db, `journal_signals/${activeJournal.id}`);
        const unsubscribe = onValue(signalRef, (snapshot) => { if (snapshot.exists()) fetchPosts(activeJournal.id, undefined, false); });
        return () => unsubscribe();
    }, [activeJournal]);

    useLayoutEffect(() => {
        if (posts.length > 0 && !isInitialLoaded && activeJournal) {
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            setTimeout(() => setIsInitialLoaded(true), 50);
        }
    }, [posts, isInitialLoaded, activeJournal]);

    useEffect(() => {
        const lastPost = posts[posts.length - 1];
        const prevLastPost = posts.length > prevPostsLength.current ? posts[prevPostsLength.current - 1] : null;
        if (isInitialLoaded && lastPost && prevLastPost && lastPost.id !== prevLastPost.id) {
            const container = scrollContainerRef.current;
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (lastPost.username === username || scrollHeight - scrollTop - clientHeight < 200) {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
        prevPostsLength.current = posts.length;
    }, [posts, isInitialLoaded, username]);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
        if (scrollTop < 50 && hasMore && !loadingMore && posts.length > 0) {
            setLoadingMore(true);
            prevScrollHeight.current = scrollHeight;
            const oldestPost = posts[0];
            if (activeJournal) fetchPosts(activeJournal.id, oldestPost.created_at);
        }
    };

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (container && prevScrollHeight.current > 0 && container.scrollHeight > prevScrollHeight.current) {
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prevScrollHeight.current;
            container.scrollTop = diff + container.scrollTop;
            prevScrollHeight.current = 0;
        }
    }, [posts]);

    // ... (REST OF HANDLERS REMAIN SAME) ...
    const fetchGifs = async (query: string = "") => { setLoadingGifs(true); try { const data = await (query ? api.giphy.search(query) : api.giphy.trending()); setGifs(data.data); } catch (error) { console.error(error); } finally { setLoadingGifs(false); } };

    const handleSendGif = async (url: string) => {
        if (!activeJournal || !username) return;
        const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() };
        setPosts(prev => [...prev, tempPost]);
        try {
            await api.journal.post({ journal_id: activeJournal.id, username, content: "", image_url: url });
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

    const sortedJournals = useMemo(() => { return [...journals].sort((a, b) => { const aFollow = followedIds.includes(a.id) ? 1 : 0; const bFollow = followedIds.includes(b.id) ? 1 : 0; if (aFollow !== bFollow) return bFollow - aFollow; return b.last_updated - a.last_updated; }); }, [journals, followedIds]);

    const handleFollowToggle = async () => {
        if (!activeJournal || !username) return;
        const isFollowing = followedIds.includes(activeJournal.id);
        if (isFollowing) {
            setFollowedIds(prev => prev.filter(id => id !== activeJournal.id));
            setCurrentFollowers(prev => prev.filter(u => u !== username));
        } else {
            setFollowedIds(prev => [...prev, activeJournal.id]);
            setCurrentFollowers(prev => [username, ...prev]);
        }
        try {
            await api.journal.follow(activeJournal.id, username);
        } catch (e) { console.error(e); }
    };

    const handleReact = async (post_id: number, emoji: string) => {
        if (!username || !activeJournal) return;
        setOpenReactionPopoverId(null);
        setPosts(currentPosts => currentPosts.map(p => { if (p.id !== post_id) return p; const existingReactionIndex = p.reactions?.findIndex(r => r.username === username && r.emoji === emoji); let newReactions = p.reactions ? [...p.reactions] : []; if (existingReactionIndex !== undefined && existingReactionIndex > -1) { newReactions.splice(existingReactionIndex, 1); } else { newReactions.push({ post_id, username, emoji }); } return { ...p, reactions: newReactions }; }));
        try {
            await api.journal.react(post_id, username, emoji);
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

    const getReactionGroups = (reactions: Reaction[] | undefined) => { if (!reactions) return {}; const groups: Record<string, { count: number, hasReacted: boolean }> = {}; reactions.forEach(r => { if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false }; groups[r.emoji].count++; if (r.username === username) groups[r.emoji].hasReacted = true; }); return groups; };
    const mentionableUsers = useMemo(() => { if (!mentionQuery) return []; const chatUsers = posts.map(p => p.username); const lbUsers = leaderboardUsers.map(u => u.username); const allUsers = Array.from(new Set([...chatUsers, ...lbUsers])); return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5); }, [mentionQuery, posts, leaderboardUsers]);
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const val = e.target.value; setNewMessage(val); const cursorPos = e.target.selectionStart; const textBeforeCursor = val.slice(0, cursorPos); const match = textBeforeCursor.match(/@(\w*)$/); if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); } };
    const insertMention = (user: string) => { if (!mentionQuery) return; const cursorPos = chatInputRef.current?.selectionStart || 0; const textBefore = newMessage.slice(0, cursorPos).replace(/@(\w*)$/, `@${user} `); const textAfter = newMessage.slice(cursorPos); setNewMessage(textBefore + textAfter); setMentionQuery(null); chatInputRef.current?.focus(); };
    const handleEmojiClick = (emojiObj: any) => { setNewMessage(prev => prev + emojiObj.emoji); };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (mentionQuery && mentionableUsers.length > 0) { if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1)); } else if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0)); } else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionableUsers[mentionIndex]); } else if (e.key === 'Escape') { setMentionQuery(null); } return; } if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); } };
    const handleOpenJournal = (journal: Journal) => { router.push(`/journal?id=${journal.id}`); };
    const handleBackToGallery = () => { router.push('/journal'); };
    const notifyGlobalUpdate = () => set(ref(db, 'journal_global_signal/last_updated'), serverTimestamp());
    const notifyChatUpdate = (journalId: number) => set(ref(db, `journal_signals/${journalId}`), serverTimestamp());

    const handleDeleteJournal = async () => {
        if (!journalToDelete || !username) return;
        try {
            await api.journal.delete(journalToDelete, username);
            toast({ title: "Deleted" });
            setJournalToDelete(null);
            if (activeJournal?.id === journalToDelete) router.push('/journal');
            notifyGlobalUpdate();
        } catch (e) { console.error(e); }
    };

    const handleDeletePost = async (postId: number) => {
        if (!username) return;
        setPosts(posts.filter(p => p.id !== postId));
        try {
            await api.journal.deletePost(postId, username);
            if (activeJournal) notifyChatUpdate(activeJournal.id);
        } catch (e) {
            if (activeJournal) fetchPosts(activeJournal.id);
        }
    };

    const handleCardUploadClick = (journalId: number, e: React.MouseEvent) => { e.stopPropagation(); setUpdatingJournalId(journalId); cardFileInputRef.current?.click(); };

    const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !updatingJournalId || !username) return;
        const files = Array.from(e.target.files);
        if (files.length > 4) { toast({ variant: "destructive", title: "Limit" }); return; }
        toast({ title: "Uploading..." });
        try {
            const urls: string[] = [];
            for (const file of files) {
                const compressed = await compressImage(file);
                const { url } = await api.upload.put(compressed);
                urls.push(url);
            }
            await api.journal.updateImages(updatingJournalId, urls.join(","), username);
            notifyGlobalUpdate();
        } catch (error) { toast({ variant: "destructive", title: "Error" }); } finally { setUpdatingJournalId(null); if (cardFileInputRef.current) cardFileInputRef.current.value = ""; }
    };

    const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !activeJournal || !username) return;
        setIsUploadingChatImage(true);
        try {
            const compressed = await compressImage(e.target.files[0]);
            const { url } = await api.upload.put(compressed);
            const tempPost = { id: Date.now(), username, content: "", image_url: url, created_at: Date.now() };
            setPosts(prev => [...prev, tempPost]);
            await api.journal.post({ journal_id: activeJournal.id, username, content: "", image_url: url });
            notifyChatUpdate(activeJournal.id);
        } catch (error) { toast({ variant: "destructive", title: "Error" }); } finally { setIsUploadingChatImage(false); if (chatFileInputRef.current) chatFileInputRef.current.value = ""; }
    };

    const createJournal = async () => {
        if (!newTitle.trim() || !username) return;
        try {
            await api.journal.create({ username, title: newTitle, tags: newTags, images: "", theme: "bg-black" });
            setNewTitle(""); setNewTitle(""); setIsDialogOpen(false); notifyGlobalUpdate();
        } catch (e) { console.error(e); }
    };

    const sendPost = async () => {
        if (!newMessage.trim() || !activeJournal || !username) return;
        const tempPost = { id: Date.now(), username, content: newMessage, created_at: Date.now() };
        setPosts(prev => [...prev, tempPost]);
        setNewMessage("");
        const mentions = tempPost.content.match(/@(\w+)/g);
        if (mentions) { const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1)))); uniqueUsers.forEach(taggedUser => { if (taggedUser !== username) { addNotification(`${username} mentioned you in "${activeJournal.title}"`, taggedUser, `/journal?id=${activeJournal.id}`); } }); }
        try {
            await api.journal.post({ journal_id: activeJournal.id, username, content: tempPost.content });
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const JournalCollage = ({ imagesStr }: { imagesStr?: string }) => { const images = imagesStr ? imagesStr.split(',').filter(Boolean) : []; if (images.length === 0) return <div className="w-full h-full bg-black/40" />; return (<div className="grid grid-cols-2 grid-rows-2 w-full h-full"> <div className={`relative ${images.length === 1 ? 'col-span-2 row-span-2' : ''} ${images.length === 3 ? 'row-span-2' : ''} overflow-hidden border-r border-b border-black/10`}><img src={images[0]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div> {images.length >= 2 && <div className={`relative ${images.length === 2 ? 'row-span-2' : ''} overflow-hidden border-b border-black/10`}><img src={images[1]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>} {images.length >= 3 && <div className={`relative ${images.length === 3 ? 'col-start-2' : ''} overflow-hidden border-r border-black/10`}><img src={images[2]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>} {images.length >= 4 && <div className="relative overflow-hidden"><img src={images[3]} className="w-full h-full object-cover" alt="cover" loading="lazy" /></div>} </div>); };


    return (
        <div className="min-h-screen text-white bg-transparent overflow-hidden">
            <Header />
            <input type="file" ref={cardFileInputRef} className="hidden" accept="image/*" multiple onChange={handleCardFileChange} />
            <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileChange} />

            <main className="container mx-auto pt-20 px-4 h-screen flex gap-6 pb-4">

                {/* LEFT: JOURNAL LIST (Transparent / Floating) */}
                {/* REMOVED .glass-panel from here as requested */}
                <div className={`flex-shrink-0 w-full md:w-[38%] lg:w-[35%] flex flex-col rounded-2xl overflow-hidden ${activeJournal ? 'hidden md:flex' : 'flex'} select-none`}>
                    {/* Header - Made it look consistent but distinct */}
                    <div className="flex justify-end items-center p-4 shrink-0">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild><Button size="sm" variant="secondary" className="h-8 shadow-md glass-panel-light text-white hover:bg-white/20"><Plus className="w-4 h-4 mr-1" /> New Journal</Button></DialogTrigger>
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

                    {/* List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {sortedJournals.map((journal) => (
                                <Card key={journal.id} onClick={() => handleOpenJournal(journal)}
                                    // Applied Premium Glass Effect to CARDS INDIVIDUALLY
                                    className={`relative group cursor-pointer h-40 xl:h-48 glass-panel hover:bg-black/50 transition-all overflow-hidden shadow-lg rounded-xl 
                            ${activeJournal?.id === journal.id ? 'border-accent/50 ring-1 ring-accent/20' : 'border-white/10'}
                            ${followedIds.includes(journal.id) ? 'shadow-accent/5 border-l-2 border-l-accent' : ''} 
                            `}
                                >
                                    <div className="absolute inset-0 z-0"><JournalCollage imagesStr={journal.images} /></div>
                                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                                    {journal.username === username && (
                                        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-black/50 hover:bg-white text-white hover:text-black" onClick={(e) => handleCardUploadClick(journal.id, e)}><Upload className="w-3 h-3" /></Button>
                                            <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full bg-red-500/50 hover:bg-red-500" onClick={(e) => { e.stopPropagation(); setJournalToDelete(journal.id); }}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-1">
                                            <UserAvatar username={journal.username} className="h-6 w-6 border border-white/20" />
                                            <span className="text-[10px] text-white/60 truncate">@{journal.username}</span>
                                            {followedIds.includes(journal.id) && <Star className="w-3 h-3 text-accent fill-accent" />}
                                        </div>
                                        <h3 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{journal.title}</h3>
                                        <div className="flex gap-1 flex-wrap">{journal.tags && journal.tags.split(',').slice(0, 1).map((tag, i) => (<span key={i} className="text-[9px] bg-white/10 px-1.5 rounded text-white/70">{tag}</span>))}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: CHAT (Kept Glass Panel) */}
                <div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden ${!activeJournal ? 'hidden md:flex' : 'flex'}`}>
                    {activeJournal ? (
                        <>
                            <div className="h-16 glass-panel-light flex items-center px-6 shrink-0 justify-between select-none">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Button variant="ghost" size="icon" className="md:hidden mr-1 -ml-2 h-8 w-8" onClick={handleBackToGallery}><ArrowLeft className="w-4 h-4" /></Button>
                                    <div>
                                        <span className="font-bold text-lg text-white truncate"># {activeJournal.title}</span>
                                        <span className="text-sm text-white/40 truncate hidden sm:inline ml-2">by {activeJournal.username}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                                    <TooltipProvider>
                                        <div className="flex -space-x-1.5">
                                            {currentFollowers.map((u, i) => (
                                                <Tooltip key={i} delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-pointer">
                                                            <UserAvatar username={u} className="w-6 h-6 border border-black hover:z-10 transition-transform hover:scale-110" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-[#18181b] text-white border-white/10 z-[100]">
                                                        <p className="text-xs font-medium">{u}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </TooltipProvider>
                                    <Button
                                        size="icon" variant="ghost"
                                        className={`h-8 w-8 rounded-full ml-1 ${followedIds.includes(activeJournal.id) ? 'text-accent fill-accent' : 'text-white/40 hover:text-white'}`}
                                        onClick={handleFollowToggle}
                                    >
                                        <Star className={`w-5 h-5 ${followedIds.includes(activeJournal.id) ? 'fill-accent' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div
                                className="flex-1 p-0 overflow-y-auto relative"
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                            >
                                <div className="p-4 pb-2 min-h-full flex flex-col justify-end">
                                    {hasMore && <div className="text-center py-4 text-xs text-white/30"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>}
                                    {!hasMore && posts.length > 0 && <div className="text-center py-8 select-none"><div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3"><Hash className="w-6 h-6 text-white/20" /></div><p className="text-sm text-white/30">Start of history</p></div>}

                                    {posts.map((post, index) => {
                                        const isSequence = index > 0 && posts[index - 1].username === post.username;
                                        const timeDiff = index > 0 ? post.created_at - posts[index - 1].created_at : 0;
                                        const showHeader = !isSequence || timeDiff > 600000;
                                        const reactionGroups = getReactionGroups(post.reactions);

                                        return (
                                            <div
                                                key={post.id}
                                                className={`group relative flex gap-4 pr-2 hover:bg-white/[0.04] -mx-4 px-4 transition-colors ${showHeader ? 'mt-6' : 'mt-0.5 py-0.5'}`}
                                            >
                                                <div className="w-10 shrink-0 select-none pt-0.5">
                                                    {showHeader ? (<UserAvatar username={post.username} className="w-10 h-10 hover:opacity-90 cursor-pointer" />) : (<div className="w-10 text-[10px] text-white/20 text-center opacity-0 group-hover:opacity-100 mt-1 select-none">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {showHeader && (
                                                        <div className="flex items-center gap-2 mb-1 select-none">
                                                            <span className="text-base font-semibold text-white hover:underline cursor-pointer">{post.username}</span>
                                                            <span className="text-xs text-white/30 ml-1">{formatDate(post.created_at)} at {formatTime(post.created_at)}</span>
                                                        </div>
                                                    )}

                                                    <div className="text-base text-white/90 leading-snug whitespace-pre-wrap break-words">
                                                        <FormattedMessage content={post.content} />
                                                    </div>

                                                    {post.image_url && (
                                                        <div className="mt-2 select-none">
                                                            <img src={post.image_url} alt="Attachment" className="max-h-80 w-auto object-contain rounded-md border border-white/10" loading="lazy" />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {Object.entries(reactionGroups).map(([emoji, data]) => (
                                                            <button key={emoji} onClick={() => handleReact(post.id, emoji)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${data.hasReacted ? 'bg-indigo-500/30 border-indigo-500/60 text-indigo-100' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'}`}>
                                                                <span className="text-base leading-none">{emoji}</span>
                                                                <span className="text-xs font-bold">{data.count}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="absolute right-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -translate-y-1/2">
                                                    <Popover open={openReactionPopoverId === post.id} onOpenChange={(open) => setOpenReactionPopoverId(open ? post.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <button className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10">
                                                                <Smile className="w-4 h-4" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-1.5 bg-[#18181b] border border-white/10 rounded-full shadow-2xl backdrop-blur-md" side="top" sideOffset={5}>
                                                            <div className="flex gap-1.5">
                                                                {QUICK_EMOJIS.map(emoji => (
                                                                    <button key={emoji} className="p-1.5 hover:bg-white/10 rounded-full text-lg transition-colors" onClick={() => handleReact(post.id, emoji)}>{emoji}</button>
                                                                ))}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>

                                                    {post.username === username && (
                                                        <button onClick={() => handleDeletePost(post.id)} className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {post.username !== username && (
                                                        <button onClick={() => handleReportMessage(post)} className="bg-[#18181b] border border-white/10 shadow-lg p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10">
                                                            <Flag className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>
                            </div>
                            {/* SCROLL BUTTON */}
                            {showScrollButton && (
                                <button
                                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                                    className="absolute bottom-20 right-6 p-2 rounded-full bg-black/60 border border-white/10 text-white shadow-xl hover:bg-black/80 transition-all animate-in fade-in zoom-in z-20"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            )}

                            {/* Mention Dropup */}
                            {mentionQuery && mentionableUsers.length > 0 && (
                                <div className="absolute bottom-20 left-4 bg-[#1e1e24] border border-white/10 rounded-lg shadow-2xl overflow-hidden w-64 z-50 select-none animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="px-3 py-2 text-xs uppercase font-bold text-white/40 tracking-wider bg-white/5">Members</div>
                                    {mentionableUsers.map((u, i) => (
                                        <div key={u} className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${i === mentionIndex ? 'bg-indigo-500/20 text-white' : 'text-white/70 hover:bg-white/5'}`} onClick={() => insertMention(u)}>
                                            <UserAvatar username={u} className="w-6 h-6" /><span className="text-sm">{u}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-4 glass-panel-light shrink-0">
                                <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-lg border border-white/10 focus-within:border-white/20 transition-colors">

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-9 w-9 shrink-0 rounded"><Film className="w-5 h-5" /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent side="top" align="start" className="w-80 p-2 bg-[#1e1e24] border-white/10 text-white">
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
                                        </PopoverContent>
                                    </Popover>

                                    <Button variant="ghost" size="icon" disabled={isUploadingChatImage} onClick={() => chatFileInputRef.current?.click()} className="text-white/40 hover:text-white h-9 w-9 shrink-0 rounded">{isUploadingChatImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}</Button>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-9 w-9 shrink-0 rounded"><Smile className="w-5 h-5" /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent side="top" className="w-auto p-0 border-none bg-transparent shadow-none">
                                            <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} height={400} searchDisabled={false} skinTonesDisabled />
                                        </PopoverContent>
                                    </Popover>

                                    <textarea ref={chatInputRef} value={newMessage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={`Message #${activeJournal.title}`} className="w-full bg-transparent border-none focus:ring-0 text-white text-base placeholder:text-white/20 resize-none py-1.5 max-h-32 min-h-[36px]" rows={1} />
                                    <Button onClick={sendPost} disabled={!newMessage.trim()} className="bg-white/10 hover:bg-white text-white hover:text-black h-9 w-9 shrink-0 rounded p-0"><Send className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 select-none"><Hash className="w-16 h-16 mb-4 opacity-20" /><p className="text-base">Select a journal to start reading</p></div>
                    )}
                </div>

                <AlertDialog open={!!journalToDelete} onOpenChange={() => setJournalToDelete(null)}>
                    <AlertDialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                        <AlertDialogHeader><AlertDialogTitle>Delete Journal?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteJournal} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}

export default function JournalPage() {
    return (
        <div className="min-h-screen text-white bg-transparent overflow-hidden">
            <Suspense fallback={<div className="flex h-screen items-center justify-center text-white/50">Loading...</div>}>
                <JournalContent />
            </Suspense>
        </div>
    );
}