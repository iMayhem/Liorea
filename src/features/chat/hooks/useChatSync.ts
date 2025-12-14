import { useState, useEffect, useCallback, RefObject } from 'react';
import { ref, query, limitToLast, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { api } from '@/lib/api';
import { CHAT_ROOM, LOCAL_STORAGE_KEY } from '@/lib/constants';
import { ChatMessage } from '../types';

export const useChatSync = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // --- DEDUPLICATION HELPER ---
    const mergeAndDedupe = useCallback((current: ChatMessage[], incoming: ChatMessage[]) => {
        // console.log('[SYNC] Merging. Deleted Count:', deletedIds.size);
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

            if (isSameID) {
                // If duplicate, merge them to preserve content + reactions
                const mergedMsg = {
                    ...lastAdded,
                    ...msg,
                    // Ensure we don't lose content if one source has it and other doesn't (fetching partials)
                    message: msg.message || lastAdded.message,
                    username: msg.username || lastAdded.username,
                    timestamp: msg.timestamp || lastAdded.timestamp,
                    // Always prefer the reactions from the "incoming" (usually newer/live) source if present
                    reactions: msg.reactions || lastAdded.reactions
                };
                unique[unique.length - 1] = mergedMsg;
            } else {
                unique.push(msg);
            }
        }

        // Final Filter: Remove any messages marked as deleted
        return unique.filter(m => !m.deleted);
    }, []);

    // 1. INITIAL LOAD & LIVE LISTENER
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            let initialMessages: ChatMessage[] = [];

            try {
                const d1Messages = await api.chat.getHistory(CHAT_ROOM);
                if (mounted) {
                    initialMessages = mergeAndDedupe(initialMessages, d1Messages);

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
                    const merged = mergeAndDedupe(prev, liveMessages);

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
    }, [mergeAndDedupe]);

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
                    setMessages(prev => mergeAndDedupe(olderMessages, prev));
                }
            }
        } catch (e) { console.error("Load more failed", e); }
        finally { setLoadingMore(false); }
    }, [messages, loadingMore, hasMore, mergeAndDedupe]);

    return {
        messages,
        setMessages,
        loadMoreMessages,
        hasMore,
        loadingMore
    };
};
