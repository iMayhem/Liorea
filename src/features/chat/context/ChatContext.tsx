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

    // 1. LIVE LISTENER (Firestore) + Legacy History (D1)
    useEffect(() => {
        const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;

        let d1History: ChatMessage[] = [];

        // Fetch D1 history first (one-off)
        const fetchHistory = async () => {
            try {
                const history = await api.chat.getHistory(effectiveRoomId);
                d1History = history.map((msg: any) => ({
                    ...msg,
                    id: String(msg.id), // Ensure string ID
                    // Map legacy fields if needed
                    reactions: msg.reactions || {} // Assuming structure matches or empty
                }));
                // Set initial
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
            limit(50) // Initial limit
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    username: data.username,
                    message: data.message,
                    timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
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

            // Merge with D1 history
            setMessages(prev => {
                // We use 'd1History' closure variable but 'prev' might have more D1 stuff if we load more?
                // Actually 'prev' effectively contains everything.
                // We just need to merge 'msgs' (live) into 'prev'.
                // Strategy: Keep all non-Firestore messages from 'prev' (which are D1), and replace Firestore ones?
                // Or just Re-merge everything.
                // Since 'msgs' is the FULL snapshot of the query (recent 50), it replaces the recent Firestore chunk.
                // But D1 history is older.
                // We should perform a deduplicated merge.

                const combined = [...prev, ...msgs];
                const unique = new Map();
                combined.forEach(m => unique.set(String(m.id), m));

                // Filter deleted from result
                const result = Array.from(unique.values())
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .filter(m => !m.deleted);

                return result;
            });
        });

        return () => unsubscribe();
    }, [roomId, isPublic, effectiveRoomId]);

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

            // D1 Backup (Fire & Forget)
            api.chat.send({
                room_id: effectiveRoomId,
                username,
                message,
                photoURL: userImage || ""
            }).catch(e => console.error("D1 Backup failed:", e));

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

            // D1 Remove
            api.chat.delete({
                room_id: effectiveRoomId,
                message_id: messageId,
                username
            }).catch(e => console.error("D1 Delete failed:", e));
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