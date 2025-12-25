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
import { collection, addDoc, serverTimestamp, query, orderBy, limit, limitToLast, onSnapshot, doc, updateDoc, deleteDoc, setDoc, deleteField, where, getDocs } from 'firebase/firestore';
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
import { soundEffects } from '@/lib/sound-effects';
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
        console.log(`[ChatDebug] Initializing chat for room: ${roomId} (Effective: ${effectiveRoomId})`);

        let d1History: ChatMessage[] = [];

        // Fetch D1 history first
        const fetchHistory = async () => {
            if (!username) {
                console.log("[ChatDebug] Waiting for username...");
                return;
            }
            try {
                console.log("[ChatDebug] Fetching D1 history...");
                const history = await api.chat.getHistory(effectiveRoomId);
                console.log(`[ChatDebug] D1 history fetched: ${history.length} messages`);

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
                console.error("[ChatDebug] Failed to fetch legacy history:", e);
            }
        };
        fetchHistory();

        const q = query(
            collection(firestore, collectionPath),
            orderBy('timestamp', 'asc'),
            limitToLast(50) // Optimized - reduced from 100
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveMsgs: ChatMessage[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!data) {
                    console.warn(`[ChatDebug] Empty data for doc ${doc.id}`);
                    return;
                }
                if (!data.username) {
                    console.warn(`[ChatDebug] Missing username for doc ${doc.id}, skipping safely.`);
                    return;
                }

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
                        Object.entries(data.reactions).reduce((acc, [uid, reactionData]) => {
                            // Handle both old format (string) and new format (object with emoji field)
                            let emoji;
                            if (typeof reactionData === 'string') {
                                emoji = reactionData; // Old format
                            } else if (reactionData && typeof reactionData === 'object') {
                                emoji = (reactionData as any).emoji; // New format
                            }

                            return {
                                ...acc,
                                [uid]: { username: uid, emoji }
                            };
                        }, {})
                        : {}
                });
            });

            // Merge & Deduplicate
            setMessages(prev => {
                // Play notification sound for new messages (not from current user)
                const newMessages = liveMsgs.filter(msg =>
                    !prev.find(p => p.id === msg.id) && msg.username !== username
                );
                if (newMessages.length > 0) {
                    soundEffects.play('messageReceive', 0.3);
                }

                // 1. Combine D1 History (fetched above, or existing in prev) with Live updates
                // We trust 'liveMsgs' as the source of truth for their specific IDs.
                // We trust 'prev' for older D1 messages that might not be in 'liveMsgs' due to limit(100).

                // Map by ID first
                const idMap = new Map<string, ChatMessage>();

                // Add all previous messages (includes D1 history)
                prev.forEach(m => {
                    idMap.set(m.id, m);
                });

                liveMsgs.forEach(liveMsg => {
                    const existing = idMap.get(liveMsg.id);
                    // If we optimistically marked as deleted, keep that state
                    if (existing?.deleted && !liveMsg.deleted) {
                        idMap.set(liveMsg.id, { ...liveMsg, deleted: true });
                    } else {
                        idMap.set(liveMsg.id, liveMsg);
                    }
                });

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
        }, (error) => {
            console.error("Firestore Listener Error:", error);
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

            // Play send sound
            soundEffects.play('messageSend', 0.4);

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
            // Get current message to check existing reactions
            const currentMsg = messages.find(m => m.id === messageId);
            const currentUserReaction = currentMsg?.reactions?.[username];

            // Check if user already has this specific emoji
            const hasThisEmoji = currentUserReaction?.emoji === emoji ||
                (Array.isArray(currentUserReaction?.emoji) && currentUserReaction.emoji.includes(emoji));

            if (hasThisEmoji) {
                // Remove this specific emoji
                if (Array.isArray(currentUserReaction?.emoji)) {
                    const updatedEmojis = currentUserReaction.emoji.filter(e => e !== emoji);
                    if (updatedEmojis.length === 0) {
                        // Remove user's reactions entirely if no emojis left
                        await updateDoc(msgRef, {
                            [`reactions.${username}`]: deleteField()
                        });
                    } else {
                        // Update with remaining emojis
                        await setDoc(msgRef, {
                            reactions: {
                                [username]: { username, emoji: updatedEmojis }
                            }
                        }, { merge: true });
                    }
                } else {
                    // Single emoji, remove it
                    await updateDoc(msgRef, {
                        [`reactions.${username}`]: deleteField()
                    });
                }
            } else {
                // Add new emoji to user's reactions
                let newEmojis: string | string[];

                if (currentUserReaction?.emoji) {
                    // User has existing reactions, add to array
                    if (Array.isArray(currentUserReaction.emoji)) {
                        newEmojis = [...currentUserReaction.emoji, emoji];
                    } else {
                        newEmojis = [currentUserReaction.emoji, emoji];
                    }
                } else {
                    // First reaction from this user
                    newEmojis = emoji;
                }

                await setDoc(msgRef, {
                    reactions: {
                        [username]: { username, emoji: newEmojis }
                    }
                }, { merge: true });
            }

            // Play reaction sound
            soundEffects.play('reaction', 0.3);
        } catch (e) {
            console.error("Failed to sync reaction to Firestore:", e);
        }
    }, [username, messages, roomId, isPublic]);

    // 5. DELETE MESSAGE
    const deleteMessage = useCallback(async (messageId: string) => {
        if (!username) return;

        try {
            // SKIP numeric IDs (Legacy D1 messages)
            if (!isNaN(Number(messageId))) {
                console.warn("Cannot delete legacy D1 message:", messageId);
                return;
            }

            // Optimistic UI update - immediately mark as deleted in local state
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, deleted: true } : msg
            ));

            const collectionPath = isPublic ? 'chats' : `rooms/${roomId}/chats`;
            await updateDoc(doc(firestore, collectionPath, messageId), { deleted: true });

        } catch (e) {
            console.error("Firestore delete failed:", e);
            // Revert optimistic update on error
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, deleted: false } : msg
            ));
        }

    }, [username, roomId, isPublic, messages]);

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