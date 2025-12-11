"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove } from 'firebase/database';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const CHAT_ROOM = "study-room-1";
const LOCAL_STORAGE_KEY = 'liorea_chat_history';

export interface ChatReaction {
    id?: string;
    username: string;
    emoji: string;
}

export interface ChatMessage {
    id: string; // Can be Firebase string or D1 number (as string)
    username: string;
    message: string;
    timestamp: number;
    photoURL?: string;
    image_url?: string;
    reactions?: Record<string, ChatReaction>;
}

interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (message: string, image_url?: string) => void;
    sendReaction: (messageId: string, emoji: string) => void;
    sendTypingEvent: () => void;
    typingUsers: string[];
    loadMoreMessages: () => Promise<void>;
    hasMore: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { username, userImage } = usePresence();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // --- DEDUPLICATION HELPER ---
    // Merges two arrays of messages, removing duplicates based on (User + Content + Approx Time)
    // Priorities: Firebase Messages (String IDs) > D1 Messages (Number IDs)
    const mergeAndDedupe = (current: ChatMessage[], incoming: ChatMessage[]) => {
        const combined = [...current, ...incoming];

        // 1. Sort by time
        combined.sort((a, b) => a.timestamp - b.timestamp);

        const unique: ChatMessage[] = [];

        for (let i = 0; i < combined.length; i++) {
            const msg = combined[i];
            const lastAdded = unique[unique.length - 1];

            if (!lastAdded) {
                unique.push(msg);
                continue;
            }

            // Check for Duplicate
            const isSameID = String(msg.id) === String(lastAdded.id);
            const isSameContent = msg.username === lastAdded.username &&
                msg.message === lastAdded.message &&
                Math.abs(msg.timestamp - lastAdded.timestamp) < 5000; // 5 sec window

            if (isSameID || isSameContent) {
                // If duplicate, keep the "better" one (Firebase ID preferred usually, or the one with reactions)
                // Firebase keys look like "-OD...", D1 keys are integers "123"
                const lastIsFirebase = isNaN(Number(lastAdded.id));
                const currIsFirebase = isNaN(Number(msg.id));

                if (currIsFirebase && !lastIsFirebase) {
                    // Replace D1 entry with Firebase entry
                    unique[unique.length - 1] = msg;
                }
                // Else: Keep 'lastAdded' (it's either Firebase already, or we stick with first found)
            } else {
                unique.push(msg);
            }
        }
        return unique;
    };

    // 1. INITIAL LOAD & LIVE LISTENER
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            let initialMessages: ChatMessage[] = [];
            let sinceTimestamp = 0;

            // A. Local Storage
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) {
                    try {
                        initialMessages = JSON.parse(stored);
                        if (initialMessages.length > 0) {
                            sinceTimestamp = initialMessages[initialMessages.length - 1].timestamp;
                        }
                    } catch (e) { }
                }
            }

            // B. Fetch History from D1 (Last 50)
            // We fetch the latest chunk to ensure we have recent context, 
            // rely on dedupe to fix overlaps with LocalStorage
            try {
                const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}`);
                if (res.ok && mounted) {
                    const d1Messages = await res.json();
                    initialMessages = mergeAndDedupe(initialMessages, d1Messages);

                    // Trim local storage if too big
                    if (initialMessages.length > 200) {
                        initialMessages = initialMessages.slice(initialMessages.length - 200);
                    }

                    setMessages(initialMessages);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMessages));
                }
            } catch (e) { console.error(e); }
        };

        init();

        // C. Firebase Live Listener
        const chatRef = query(ref(db, 'chats'), limitToLast(30));
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data && mounted) {
                const liveMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                    ...val,
                    id: key,
                    reactions: val.reactions || {}
                }));

                setMessages(prev => {
                    // Merge Live messages into existing state
                    // This handles the "D1 vs Firebase" duplicate issue
                    const merged = mergeAndDedupe(prev, liveMessages);

                    // Cache updates
                    if (typeof window !== "undefined") {
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged.slice(-200)));
                    }
                    return merged;
                });
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    // 2. PAGINATION: Load Older Messages
    const loadMoreMessages = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);

        const oldestMessage = messages[0];
        try {
            const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}&before=${oldestMessage.timestamp}`);
            if (res.ok) {
                const olderMessages: ChatMessage[] = await res.json();
                if (olderMessages.length < 20) setHasMore(false);

                if (olderMessages.length > 0) {
                    setMessages(prev => mergeAndDedupe(olderMessages, prev));
                }
            }
        } catch (e) { console.error("Load more failed", e); }
        finally { setLoadingMore(false); }
    }, [messages, loadingMore, hasMore]);

    // 3. SEND MESSAGE
    const sendMessage = useCallback(async (message: string, image_url?: string) => {
        if ((!message.trim() && !image_url) || !username) return;

        // Send to Firebase (UI updates via listener)
        push(ref(db, 'chats'), {
            username,
            message,
            image_url: image_url || "",
            photoURL: userImage || "",
            timestamp: serverTimestamp()
        });

        // Backup to D1 (Silent)
        fetch(`${WORKER_URL}/chat/send`, {
            method: "POST",
            body: JSON.stringify({
                room_id: CHAT_ROOM,
                username,
                message,
                photoURL: userImage || ""
            }),
            headers: { "Content-Type": "application/json" }
        }).catch(e => console.error("D1 Backup failed:", e));

    }, [username, userImage]);

    // 4. SEND REACTION
    const sendReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!username) return;

        // Optimistic check: Do we already have this reaction?
        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;

        let existingReactionKey: string | null = null;
        if (msg.reactions) {
            Object.entries(msg.reactions).forEach(([key, r]) => {
                if (r.username === username && r.emoji === emoji) {
                    existingReactionKey = key;
                }
            });
        }

        const reactionsRef = ref(db, `chats/${messageId}/reactions`);
        if (existingReactionKey) {
            remove(ref(db, `chats/${messageId}/reactions/${existingReactionKey}`));
        } else {
            push(reactionsRef, { username, emoji });
        }
    }, [username, messages]);

    const sendTypingEvent = useCallback(async () => { }, []);

    const value = useMemo(() => ({
        messages, sendMessage, sendReaction, typingUsers, sendTypingEvent, loadMoreMessages, hasMore
    }), [messages, sendMessage, sendReaction, typingUsers, sendTypingEvent, loadMoreMessages, hasMore]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat error');
    return context;
};