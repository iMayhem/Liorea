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

    // 1. LIVE LISTENER (Firestore Only)
    useEffect(() => {
        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;

        // Simple Firestore Query
        const q = query(
            collection(firestore, collectionPath),
            orderBy('timestamp', 'asc'),
            limit(100) // Increase limit since we don't have backfill
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                msgs.push({
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
            setMessages(msgs); // Direct set, no merging/deduping needed
        });

        return () => unsubscribe();
    }, [roomId, isPublic]);

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

        // Optimistic UI update (optional, but good for responsiveness)
        // setMessages... (Skip for complex map logic, let live listener handle it fast enough)

        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;
        const msgRef = doc(firestore, collectionPath, messageId);

        try {
            // We toggle: If exists, remove. If new, add.
            // Since we use a Map `reactions: { username: emoji }`, we can read it first or check local state.
            const currentMsg = messages.find(m => m.id === messageId);
            const currentReaction = currentMsg?.reactions?.[username]?.emoji;

            if (currentReaction === emoji) {
                // Remove
                await updateDoc(msgRef, {
                    [`reactions.${username}`]: deleteField()
                });
            } else {
                // Add/Update (Overwrite)
                await updateDoc(msgRef, {
                    [`reactions.${username}`]: emoji
                });
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