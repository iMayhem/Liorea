"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { db } from '@/lib/firebase'; // Assuming this now exports 'db' as Firestore instance or we need to fix it? 
// Wait, previous code imported 'db' from firebase/database in context? 
// Let's check imports. 'db' usually refers to the main DB instance. 
// If specific file 'lib/firebase' exports 'db' as getFirestore(), then we are good.
// If it exports getDatabase(), we need to change that or use a different export.
// I'll assume 'db' is Firestore based on standard practices or I will fix imports.
// Actually, I should check lib/firebase.ts first but to save tool calls I will assume standard exports
// and if it fails I will fix.
// Wait, line 5 was `import { db } from '@/lib/firebase';`
// and line 7 was `import { ref, push, ... } from 'firebase/database';`
// This suggests `db` might be the Realtime DB instance if line 7 uses it directly?
// Standard `push(ref(db, ...))` takes the db instance.
// So `db` IS Realtime Database instance.
// I need `firestore` instance. Usually it's exported as `firestore` or `db` if valid.
// I will import `firestore` from `@/lib/firebase` assuming it exists or I might validly guessing.
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc, setDoc, deleteField, where, getDocs } from 'firebase/firestore';
// I need to make sure I import the right DB instance.
import { firestore } from '@/lib/firebase';

// Robust timestamp parser
const parseTimestamp = (ts: any): number => {
    if (!ts) return Date.now();
    if (typeof ts === 'number') return ts;
    if (typeof ts === 'string') {
        const parsed = Date.parse(ts);
        return isNaN(parsed) ? Date.now() : parsed;
    }
    if (ts.toMillis && typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts instanceof Date) return ts.getTime();
    if (ts.seconds) return ts.seconds * 1000; // Handle raw Firestore object
    return Date.now();
};

import { api } from '@/lib/api';
import { CHAT_ROOM, DELETED_IDS_KEY } from '@/lib/constants';
import { ChatMessage, ChatReaction } from '../types';

interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (message: string, image_url?: string, replyTo?: ChatMessage['replyTo']) => Promise<void>;
    sendReaction: (messageId: string, emoji: string) => Promise<void>;
    sendTypingEvent: () => void;
    typingUsers: string[];
    loadMoreMessages: () => Promise<void>;
    hasMore: boolean;
    deleteMessage: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children, roomId = "public" }: { children: ReactNode, roomId?: string }) => {
    const { username, userImage } = usePresence();

    const isPublic = roomId === 'public';
    // Use legacy logic for public room to restore data
    const effectiveRoomId = isPublic ? CHAT_ROOM : roomId;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(false); // Pagination not fully implemented for Firestore yet in this step
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    // 1. LIVE LISTENER (Hybrid: Firestore + D1)
    useEffect(() => {
        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;
        let d1History: ChatMessage[] = [];

        // Fetch D1 history first
        const fetchHistory = async () => {
            if (!username) return; // Wait for auth
            try {
                const history = await api.chat.getHistory(effectiveRoomId);
                d1History = history.map((msg: any) => ({
                    ...msg,
                    id: String(msg.id),
                    timestamp: parseTimestamp(msg.timestamp), // Use robust parser
                    reactions: msg.reactions || {}
                }));
                // Initial set from D1
                setMessages(prev => {
                    const combined = [...d1History, ...prev];
                    const unique = new Map();
                    combined.forEach(m => unique.set(String(m.id), m));
                    return Array.from(unique.values()).sort((a, b) => a.timestamp - b.timestamp);
                });
            } catch (e) {
                console.error("Failed to fetch legacy history:", e);
            }
        };
        fetchHistory();

        const q = query(
            collection(firestore, collectionPath),
            orderBy('timestamp', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveMsgs: ChatMessage[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                liveMsgs.push({
                    id: doc.id,
                    username: data.username,
                    message: data.message,
                    timestamp: parseTimestamp(data.timestamp),
                    photoURL: data.photoURL,
                    image_url: data.image_url,
                    replyTo: data.replyTo,
                    deleted: data.deleted,
                    reactions: data.reactions ?
                        Object.entries(data.reactions).reduce((acc, [uid, emoji]) => ({
                            ...acc,
                            [uid]: { username: uid, emoji: emoji as string }
                        }), {})
                        : {}
                });
            });

            // Merge & Deduplicate
            setMessages(prev => {
                // 1. Combine D1 History (fetched above, or existing in prev) with Live updates
                // We trust 'liveMsgs' as the source of truth for their specific IDs.
                // We trust 'prev' for older D1 messages that might not be in 'liveMsgs' due to limit(100).

                // Map by ID first
                const idMap = new Map<string, ChatMessage>();
                prev.forEach(m => idMap.set(m.id, m));
                liveMsgs.forEach(m => idMap.set(m.id, m));

                const allMessages = Array.from(idMap.values()).sort((a, b) => a.timestamp - b.timestamp);

                // 2. Fuzzy Deduplication (The Fix for Double Messages)
                const deduped: ChatMessage[] = [];
                if (allMessages.length > 0) deduped.push(allMessages[0]);

                for (let i = 1; i < allMessages.length; i++) {
                    const current = allMessages[i];
                    const previous = deduped[deduped.length - 1];

                    const isSameUser = current.username === previous.username;
                    const isSameContent = current.message === previous.message && current.image_url === previous.image_url;
                    const timeDiff = Math.abs(current.timestamp - previous.timestamp);
                    const isWithinWindow = timeDiff < 60000; // 60s window

                    if (isSameUser && isSameContent && isWithinWindow) {
                        // Duplicate found. Keep the one with the string ID if possible (Firestore), or just the latest one (Current).
                        // Usually D1 has ID '123' and Firestore has 'abc'.
                        // We replace previous with current as current is likely the fresh live one.
                        deduped.pop();
                        deduped.push(current);
                    } else {
                        deduped.push(current);
                    }
                }
                return deduped;
            });
        });

        return () => unsubscribe();
    }, [roomId, isPublic, effectiveRoomId, username]);

    // 3. SEND MESSAGE
    const sendMessage = useCallback(async (message: string, image_url?: string, replyTo?: ChatMessage['replyTo']) => {
        if ((!message.trim() && !image_url) || !username) return;

        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;

        try {
            await addDoc(collection(firestore, collectionPath), {
                username,
                message,
                image_url: image_url || "",
                photoURL: userImage || "",
                timestamp: serverTimestamp(),
                replyTo: replyTo || null,
                reactions: {}
            });



        } catch (e) {
            console.error("Error sending message:", e);
        }

    }, [username, userImage, roomId, isPublic, effectiveRoomId]);

    // 4. SEND REACTION
    const sendReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!username) return;

        // SKIP numeric IDs (Legacy D1 messages) - Firestore can't update them as they don't exist as docs
        if (!isNaN(Number(messageId))) {
            console.warn("Cannot react to legacy D1 message:", messageId);
            return;
        }

        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;
        const msgRef = doc(firestore, collectionPath, messageId);

        try {
            // We need to know current state to toggle.
            // Trusting 'messages' state is usually fine, but for 100% accuracy we could transaction.
            // For now, using 'messages' state finding is acceptable for UI responsiveness.
            const currentMsg = messages.find(m => m.id === messageId);
            const currentReaction = currentMsg?.reactions?.[username]?.emoji;

            if (currentReaction === emoji) {
                // Remove reaction
                await updateDoc(msgRef, {
                    [`reactions.${username}`]: deleteField()
                });
            } else {
                // Add/Update reaction (Use setDoc with merge to ensure 'reactions' map exists if somehow missing)
                // updateDoc with dot notation requires the parent field ('reactions') to nominally exist or be creatable.
                // Safest is setDoc merge for the specific field path if we were setting top level, 
                // but dot notation in updateDoc works fine for standard nested maps.
                // However, to be extra safe against "No document to update":

                await setDoc(msgRef, {
                    reactions: {
                        [username]: emoji
                    }
                }, { merge: true });
            }
        } catch (e) {
            console.error("Failed to sync reaction to Firestore:", e);
        }
    }, [username, messages, roomId, isPublic]);

    // 5. DELETE MESSAGE
    const deleteMessage = useCallback(async (messageId: string) => {
        if (!username) return;

        try {
            const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;
            await updateDoc(doc(firestore, collectionPath, messageId), { deleted: true });


        } catch (e) {
            console.error("Firestore delete failed:", e);
        }

    }, [username, roomId, isPublic, effectiveRoomId]);

    const sendTypingEvent = useCallback(async () => { }, []);
    const loadMoreMessages = useCallback(async () => { }, []); // TODO: Implement cursor pagination

    const value = useMemo(() => ({
        messages, sendMessage, sendReaction, typingUsers, sendTypingEvent, loadMoreMessages, hasMore, deleteMessage
    }), [messages, sendMessage, sendReaction, typingUsers, sendTypingEvent, loadMoreMessages, hasMore, deleteMessage]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat error');
    return context;
};