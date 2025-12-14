import { useState, useEffect, useCallback, RefObject } from 'react';
import { ref, query, limitToLast, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { api } from '@/lib/api';
import { CHAT_ROOM, LOCAL_STORAGE_KEY } from '@/lib/constants';
import { ChatMessage } from '../types';

export const useChatSync = (deletedMessageIdsRef: RefObject<Set<string> | null>, deletedTick: number) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // --- RE-FILTERING EFFECT ---
    // React to changes in the blacklist (e.g. after initial load or deletion)
    useEffect(() => {
        const currentDeleted = deletedMessageIdsRef.current || new Set<string>();
        setMessages(prev => {
            const filetered = prev.filter(msg => !currentDeleted.has(String(msg.id)));
            // Only update if count changes to avoid loops? 
            // setMessages is stable, but creating new array might be wasteful if no change. 
            // But correctness first.
            if (filetered.length !== prev.length) {
                console.log('[SYNC] Re-filtering messages due to tick update. Removed:', prev.length - filetered.length);
                return filetered;
            }
            return prev;
        });
    }, [deletedTick, deletedMessageIdsRef]);

    // --- DEDUPLICATION HELPER ---
    const mergeAndDedupe = useCallback((current: ChatMessage[], incoming: ChatMessage[], deletedIds: Set<string>) => {
        // console.log('[SYNC] Merging. Deleted Count:', deletedIds.size);
        const combined = [...current, ...incoming].filter(msg => {
            const isDeleted = deletedIds.has(String(msg.id));
            if (isDeleted) console.log('[SYNC] Filtering out deleted msg:', msg.id);
            return !isDeleted;
        });

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
                const lastIsFirebase = isNaN(Number(lastAdded.id));
                const currIsFirebase = isNaN(Number(msg.id));

                if (currIsFirebase && !lastIsFirebase) {
                    unique[unique.length - 1] = msg;
                }
            } else {
                unique.push(msg);
            }
        }
        return unique;
    }, []);

    // 1. INITIAL LOAD & LIVE LISTENER
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            let initialMessages: ChatMessage[] = [];

            // A. Local Storage
            const currentDeletedIds = deletedMessageIdsRef.current || new Set<string>();

            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) {
                    try {
                        initialMessages = JSON.parse(stored);
                        initialMessages = initialMessages.filter(m => !currentDeletedIds.has(String(m.id)));
                    } catch (e) { }
                }
            }

            // B. Fetch History from D1
            try {
                const d1Messages = await api.chat.getHistory(CHAT_ROOM);
                if (mounted) {
                    initialMessages = mergeAndDedupe(initialMessages, d1Messages, currentDeletedIds);

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

        const handleSnapshot = (snapshot: any) => {
            const data = snapshot.val();
            if (data && mounted) {
                const liveMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                    ...val,
                    id: key,
                    reactions: val.reactions || {}
                }));

                setMessages(prev => {
                    const currentDeleted = deletedMessageIdsRef.current || new Set<string>();
                    const merged = mergeAndDedupe(prev, liveMessages, currentDeleted);

                    if (typeof window !== "undefined") {
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged.slice(-200)));
                    }
                    return merged;
                });
            }
        };

        const unsubscribe = onValue(chatRef, handleSnapshot);

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [mergeAndDedupe, deletedMessageIdsRef]);

    // 2. PAGINATION
    const loadMoreMessages = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);

        const oldestMessage = messages[0];
        try {
            const olderMessages: ChatMessage[] = await api.chat.getHistory(CHAT_ROOM, oldestMessage.timestamp);
            if (olderMessages) {
                if (olderMessages.length < 20) setHasMore(false);

                if (olderMessages.length > 0) {
                    const currentDeleted = deletedMessageIdsRef.current || new Set<string>();
                    setMessages(prev => mergeAndDedupe(olderMessages, prev, currentDeleted));
                }
            }
        } catch (e) { console.error("Load more failed", e); }
        finally { setLoadingMore(false); }
    }, [messages, loadingMore, hasMore, deletedMessageIdsRef, mergeAndDedupe]);

    return {
        messages,
        setMessages,
        loadMoreMessages,
        hasMore,
        loadingMore
    };
};
