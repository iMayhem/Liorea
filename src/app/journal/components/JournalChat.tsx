"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Image as ImageIcon, Loader2, Smile, Star, Film, Search, ChevronDown, Flag, Trash2, Hash, X, ListTodo, Plus, Minus } from 'lucide-react';
import { TaskMessage, TaskListContent } from '@/components/chat/TaskMessage';
import UserAvatar from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { db } from '@/lib/firebase';
import { ref, onValue, set, serverTimestamp, push } from 'firebase/database';
import { compressImage } from '@/lib/compress';
import dynamic from 'next/dynamic';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePresence } from '@/features/study/context/PresenceContext';
import { api } from '@/lib/api';
import { Journal, Post, Reaction, GiphyResult } from '../types';
import { FormattedMessage } from '@/components/chat/FormattedMessage';
import { MessageActions } from '@/components/chat/MessageActions';
import { MentionMenu } from '@/components/chat/MentionMenu';
import { ImageViewer } from '@/components/ui/ImageViewer';

interface JournalChatProps {
    activeJournal: Journal | null;
    username: string;
    isFollowed: boolean;
    onToggleFollow: () => void;
    onBack: () => void;
    leaderboardUsers: any[]; // Or specific type
}

export const JournalChat: React.FC<JournalChatProps> = ({
    activeJournal,
    username,
    isFollowed,
    onToggleFollow,
    onBack,
    leaderboardUsers
}) => {
    const { toast } = useToast();
    const { addNotification } = useNotifications();
    const { isMod } = usePresence();

    const [posts, setPosts] = useState<Post[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoaded, setIsInitialLoaded] = useState(false);
    const [currentFollowers, setCurrentFollowers] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploadingChatImage, setIsUploadingChatImage] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [gifs, setGifs] = useState<GiphyResult[]>([]);
    const [gifSearch, setGifSearch] = useState("");
    const [loadingGifs, setLoadingGifs] = useState(false);

    // Reply State
    const [replyingTo, setReplyingTo] = useState<{ id: number, username: string, content: string } | null>(null);
    const [openReactionPopoverId, setOpenReactionPopoverId] = useState<number | null>(null);
    const [isGifPopoverOpen, setIsGifPopoverOpen] = useState(false);

    // Image Viewer State
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    useEffect(() => {
        if (isGifPopoverOpen && gifs.length === 0) {
            fetchGifs();
        }
    }, [isGifPopoverOpen]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef(0);

    // const prevPostsLength = useRef(0); // Removed unused ref
    const chatFileInputRef = useRef<HTMLInputElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

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
                        // For updates, we just append/merge.
                        // Actually, simplified logic: if generic update, just fetch latest?
                        // But here we want to dedupe.
                        // The server fix I did earlier set isUpdate=false for signal updates.
                        // So usually this block might not be hit if I kept that logic.
                        // Wait, previous fix passed `false`. But `isUpdate` param is here.
                        // If I pass false, it goes to `else` block (full replace).
                        // That is what fixed the dupes.
                        return prev; // Unreachable if I follow my fix pattern
                    });
                } else {
                    setPosts(newPosts);
                    if (newPosts.length < 20) setHasMore(false);
                }
            }
        } catch (e) { console.error(e); setLoadingMore(false); }
    };

    const fetchFollowers = async (id: number) => { try { const data = await api.journal.getFollowers(id); setCurrentFollowers(data); } catch (e) { } };

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

    const lastPostIdRef = useRef<number | null>(null);

    useEffect(() => {
        const lastPost = posts[posts.length - 1];
        if (isInitialLoaded && lastPost) {
            // Basic Logic: If the LAST post ID changed, it means a new message arrived at the bottom.
            // If we just loaded older history, the last post ID remains the same, so this won't trigger.
            if (lastPostIdRef.current !== lastPost.id) {
                const container = scrollContainerRef.current;
                if (container) {
                    const { scrollTop, scrollHeight, clientHeight } = container;
                    // If user sent it OR if they are already near bottom
                    if (lastPost.username === username || scrollHeight - scrollTop - clientHeight < 200) {
                        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }
            lastPostIdRef.current = lastPost.id;
        }
    }, [posts, isInitialLoaded, username]);

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (container && prevScrollHeight.current > 0 && container.scrollHeight > prevScrollHeight.current) {
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prevScrollHeight.current;
            container.scrollTop = diff + container.scrollTop;
            prevScrollHeight.current = 0;
        }
    }, [posts]);

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

    const notifyChatUpdate = (journalId: number) => set(ref(db, `journal_signals/${journalId}`), serverTimestamp());

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

    const handleReact = async (post_id: number, emoji: string) => {
        if (!username || !activeJournal) return;
        setOpenReactionPopoverId(null);
        setPosts(currentPosts => currentPosts.map(p => { if (p.id !== post_id) return p; const existingReactionIndex = p.reactions?.findIndex(r => r.username === username && r.emoji === emoji); let newReactions = p.reactions ? [...p.reactions] : []; if (existingReactionIndex !== undefined && existingReactionIndex > -1) { newReactions.splice(existingReactionIndex, 1); } else { newReactions.push({ post_id, username, emoji }); } return { ...p, reactions: newReactions }; }));
        try {
            await api.journal.react(post_id, username, emoji);
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

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

    const sendPost = async () => {
        if (!newMessage.trim() || !activeJournal || !username) return;
        const tempPost = {
            id: Date.now(),
            username,
            content: newMessage,
            created_at: Date.now(),
            replyTo: replyingTo || undefined
        };
        setPosts(prev => [...prev, tempPost]);
        setNewMessage("");
        setReplyingTo(null);
        const mentions = tempPost.content.match(/@(\w+)/g);
        if (mentions) { const uniqueUsers = Array.from(new Set(mentions.map(m => m.substring(1)))); uniqueUsers.forEach(taggedUser => { if (taggedUser !== username) { addNotification(`${username} mentioned you in "${activeJournal.title}"`, taggedUser, `/journal?id=${activeJournal.id}`); } }); }
        try {
            await api.journal.post({
                journal_id: activeJournal.id,
                username,
                content: tempPost.content,
                replyTo: replyingTo ? JSON.stringify(replyingTo) : undefined
            });
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

    const handleSendTaskList = async (title: string, items: string[]) => {
        if (!activeJournal || !username) return;
        const content: TaskListContent = { type: 'task_list', title, items };
        const contentString = JSON.stringify(content);
        const tempPost = { id: Date.now(), username, content: contentString, created_at: Date.now() };
        setPosts(prev => [...prev, tempPost]);
        try {
            await api.journal.post({ journal_id: activeJournal.id, username, content: contentString });
            notifyChatUpdate(activeJournal.id);
        } catch (e) { console.error(e); }
    };

    const mentionableUsers = useMemo(() => { if (!mentionQuery) return []; const chatUsers = posts.map(p => p.username); const lbUsers = leaderboardUsers.map(u => u.username); const allUsers = Array.from(new Set([...chatUsers, ...lbUsers])); return allUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5); }, [mentionQuery, posts, leaderboardUsers]);
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const val = e.target.value; setNewMessage(val); const cursorPos = e.target.selectionStart; const textBeforeCursor = val.slice(0, cursorPos); const match = textBeforeCursor.match(/@(\w*)$/); if (match) { setMentionQuery(match[1]); setMentionIndex(0); } else { setMentionQuery(null); } };
    const insertMention = (user: string) => { if (!mentionQuery) return; const cursorPos = chatInputRef.current?.selectionStart || 0; const textBefore = newMessage.slice(0, cursorPos).replace(/@(\w*)$/, `@${user} `); const textAfter = newMessage.slice(cursorPos); setNewMessage(textBefore + textAfter); setMentionQuery(null); chatInputRef.current?.focus(); };
    const handleEmojiClick = (emojiObj: any) => { setNewMessage(prev => prev + emojiObj.emoji); };
    const handleReply = (post: Post) => {
        setReplyingTo({
            id: post.id,
            username: post.username,
            content: post.content || (post.image_url ? "Image" : "")
        });
        chatInputRef.current?.focus();
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (mentionQuery && mentionableUsers.length > 0) { if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(prev => (prev > 0 ? prev - 1 : mentionableUsers.length - 1)); } else if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(prev => (prev < mentionableUsers.length - 1 ? prev + 1 : 0)); } else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionableUsers[mentionIndex]); } else if (e.key === 'Escape') { setMentionQuery(null); } return; } if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); } };

    const getReactionGroups = (reactions: Reaction[] | undefined) => { if (!reactions) return {}; const groups: Record<string, { count: number, hasReacted: boolean, users: string[] }> = {}; reactions.forEach(r => { if (!groups[r.emoji]) groups[r.emoji] = { count: 0, hasReacted: false, users: [] }; groups[r.emoji].count++; groups[r.emoji].users.push(r.username); if (r.username === username) groups[r.emoji].hasReacted = true; }); return groups; };
    const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const scrollToMessage = (id: number) => {
        const el = document.getElementById(`journal-post-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-white/10', 'transition-colors', 'duration-500');
            setTimeout(() => el.classList.remove('bg-white/10'), 1000);
        }
    };

    if (!activeJournal) return (
        <div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden hidden md:flex`}>
            <div className="flex flex-col items-center justify-center h-full text-white/20 select-none"><Hash className="w-16 h-16 mb-4 opacity-20" /><p className="text-base">Select a journal to start reading</p></div>
        </div>
    );

    return (
        <div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden flex`}>
            <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileChange} />
            <div className="h-16 glass-panel-light flex items-center px-6 shrink-0 justify-between select-none">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Button variant="ghost" size="icon" className="md:hidden mr-1 -ml-2 h-8 w-8" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
                    <div>
                        <span className="font-bold text-lg text-white truncate"># {activeJournal.title}</span>
                        <span className="text-sm text-white/40 truncate hidden sm:inline ml-2">by {activeJournal.username}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                    <TooltipProvider>
                        <div className="flex -space-x-1.5">
                            {currentFollowers.map((u) => (
                                <Tooltip key={u} delayDuration={0}>
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
                        className={`h-8 w-8 rounded-full ml-1 ${isFollowed ? 'text-accent fill-accent' : 'text-white/40 hover:text-white'}`}
                        onClick={onToggleFollow}
                    >
                        <Star className={`w-5 h-5 ${isFollowed ? 'fill-accent' : ''}`} />
                    </Button>
                </div>
            </div>

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
                                id={`journal-post-${post.id}`}
                                className={`group relative flex gap-4 pr-2 hover:bg-white/[0.04] -mx-4 px-4 transition-colors ${showHeader ? 'mt-6' : 'mt-0.5 py-0.5'}`}
                            >
                                <div className="w-10 shrink-0 select-none pt-0.5">
                                    {showHeader ? (<UserAvatar username={post.username} className="w-10 h-10 hover:opacity-90 cursor-pointer" />) : (<div className="w-10 text-[10px] text-white/20 text-center opacity-0 group-hover:opacity-100 mt-1 select-none">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {showHeader && (
                                        <div className="flex items-center gap-2 mb-1 select-none">
                                            <span className="text-base font-semibold text-white hover:underline cursor-pointer">{post.username}</span>
                                            {isMod(post.username) && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">MOD</span>
                                            )}
                                            <span className="text-xs text-white/30 ml-1">{formatDate(post.created_at)} at {formatTime(post.created_at)}</span>
                                        </div>
                                    )}

                                    {post.replyTo && (
                                        <div
                                            onClick={() => scrollToMessage(post.replyTo!.id)}
                                            className="flex items-center gap-2 mb-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-xs group/reply select-none"
                                        >
                                            <div className="w-8 h-3 border-l-2 border-t-2 border-white/60 rounded-tl-md border-b-0 border-r-0 translate-y-1"></div>
                                            <UserAvatar username={post.replyTo.username} className="w-4 h-4" />
                                            <span className="font-semibold text-white/80 group-hover/reply:underline active:scale-95 transition-transform">{post.replyTo.username}</span>
                                            <span className="text-white/60 truncate max-w-[200px]">{post.replyTo.content}</span>
                                        </div>
                                    )}

                                    <div className="text-base text-white/90 leading-snug whitespace-pre-wrap break-words">
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(post.content);
                                                if (parsed && parsed.type === 'task_list') {
                                                    return <TaskMessage postId={post.id} content={parsed} isOwner={post.username === username} />;
                                                }
                                            } catch (e) { }
                                            return <FormattedMessage content={post.content} />;
                                        })()}
                                    </div>

                                    {post.image_url && (
                                        <div className="mt-2 select-none">
                                            <img
                                                src={post.image_url}
                                                alt="Attachment"
                                                className="h-[200px] w-auto object-cover rounded-md border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                                                loading="lazy"
                                                onClick={() => setViewerImage(post.image_url!)}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {Object.entries(reactionGroups).map(([emoji, data]) => (
                                            <TooltipProvider key={emoji}>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <button key={emoji} onClick={() => handleReact(post.id, emoji)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${data.hasReacted ? 'bg-indigo-500/30 border-indigo-500/60 text-indigo-100' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                                                            <span className="text-base leading-none">{emoji}</span>
                                                            <span className="text-xs font-bold">{data.count}</span>
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-[#18181b] text-white border-white/10 z-[100]">
                                                        <div className="flex flex-col gap-1">
                                                            {data.users.slice(0, 5).map((u, i) => (
                                                                <span key={i} className="text-xs font-medium">{u}</span>
                                                            ))}
                                                            {data.users.length > 5 && <span className="text-xs text-muted-foreground">and {data.users.length - 5} more</span>}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </div>
                                </div>

                                <MessageActions
                                    isCurrentUser={post.username === username}
                                    onReact={(emoji) => handleReact(post.id, emoji)}
                                    onReply={() => handleReply(post)}
                                    onDelete={() => handleDeletePost(post.id)}
                                    onReport={() => handleReportMessage(post)}
                                    isOpen={openReactionPopoverId === post.id}
                                    onOpenChange={(open) => setOpenReactionPopoverId(open ? post.id : null)}
                                />
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>

            {showScrollButton && (
                <button
                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="absolute bottom-20 right-6 p-2 rounded-full bg-black/60 border border-white/10 text-white shadow-xl hover:bg-black/80 transition-all animate-in fade-in zoom-in z-20"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            )}



            <div className="p-4 bg-card/10 shrink-0 border-t border-white/5">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-t-lg border-x border-t border-white/10 mb-[-1px] relative z-10 w-full">
                        <div className="flex items-center gap-2 text-sm text-white/60 truncate">
                            <div className="w-1 h-8 bg-white/40 rounded-full shrink-0"></div>
                            <span className="font-semibold text-white">Replying to {replyingTo.username}</span>
                            <span className="truncate opacity-70"> - {replyingTo.content.substring(0, 50)}{replyingTo.content.length > 50 ? '...' : ''}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white" onClick={() => setReplyingTo(null)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                <div className={`relative flex items-end gap-2 bg-muted/20 p-2 border border-white/10 focus-within:border-white/20 transition-colors ${replyingTo ? 'rounded-b-lg rounded-tr-lg' : 'rounded-lg'}`}>
                    {/* ... (keep existing JSX here, but since multi_replace is chunk-based, I'll just append ImageViewer at the end of the main div) */}
                    <MentionMenu
                        isOpen={!!mentionQuery && mentionableUsers.length > 0}
                        query={mentionQuery}
                        options={mentionableUsers}
                        selectedIndex={mentionIndex}
                        onSelect={insertMention}
                        className="absolute bottom-full left-0 mb-2 w-64"
                    />

                    <Popover open={isGifPopoverOpen} onOpenChange={setIsGifPopoverOpen}>
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
                                        <img key={gif.id} src={gif.images.fixed_height.url} className="w-full h-auto object-cover rounded cursor-pointer hover:opacity-80" onClick={() => handleSendGif(gif.images.fixed_height.url)} />
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
                            <EmojiPicker theme={'dark' as any} onEmojiClick={handleEmojiClick} height={400} searchDisabled={false} skinTonesDisabled />
                        </PopoverContent>
                    </Popover>

                    <textarea ref={chatInputRef} value={newMessage} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Message" className="w-full bg-transparent border-none focus:ring-0 text-white text-base placeholder:text-white/20 resize-none py-1.5 max-h-32 min-h-[36px]" rows={1} />

                    <Button onClick={sendPost} disabled={!newMessage.trim()} className="bg-white/10 hover:bg-white text-white hover:text-black h-9 w-9 shrink-0 rounded p-0"><Send className="w-4 h-4" /></Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-9 w-9 shrink-0 rounded"><ListTodo className="w-5 h-5" /></Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="end" className="w-80 p-4 bg-[#1e1e24] border-white/10 text-white">
                            <TaskListCreator onSend={(title, items) => {
                                handleSendTaskList(title, items);
                                // The Popover closes automatically if we click outside, but to close it programmatically we might need controlled state.
                                // For simplicity, we assume user clicks send and it closes or we can't easily close it without controlling open state of Popover.
                                // Let's try to make it controlled? Or just let it be.
                            }} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <ImageViewer
                isOpen={!!viewerImage}
                onClose={() => setViewerImage(null)}
                src={viewerImage || ""}
            />
        </div>
    );
};

const TaskListCreator = ({ onSend }: { onSend: (title: string, items: string[]) => void }) => {
    const [title, setTitle] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [newItem, setNewItem] = useState("");
    const [items, setItems] = useState<string[]>([]);

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem("");
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Create Task List</h4>
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="List Title (e.g. Today's Tasks)"
                className="h-8 text-sm bg-black/20 border-white/10"
            />
            <div className="space-y-1 max-h-40 overflow-y-auto">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded text-xs group">
                        <span>{i + 1}. {item}</span>
                        <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-red-400"><Minus className="w-3 h-3" /></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="New Task..."
                    className="h-8 text-sm bg-black/20 border-white/10"
                />
                <Button size="icon" variant="ghost" onClick={addItem} className="h-8 w-8 shrink-0 hover:bg-white/10"><Plus className="w-4 h-4" /></Button>
            </div>
            <Button size="sm" onClick={() => { if (items.length > 0) onSend(title, items); }} disabled={items.length === 0} className="w-full mt-1">Send List</Button>
        </div>
    );
};
