"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, remove, serverTimestamp } from 'firebase/database';

import { api } from '@/lib/api';
import { CHAT_ROOM, DELETED_IDS_KEY } from '@/lib/constants';
import { ChatMessage, ChatReaction } from '../types';
import { useChatSync } from '../hooks/useChatSync';

interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (message: string, image_url?: string, replyTo?: ChatMessage['replyTo']) => void;
    sendReaction: (messageId: string, emoji: string) => void;
    sendTypingEvent: () => void;
    typingUsers: string[];
    loadMoreMessages: () => Promise<void>;
    hasMore: boolean;
    deleteMessage: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { username, userImage } = usePresence();

    // We use a ref for the sync hook to avoid stale closures in listeners
    const deletedIdsRef = useRef<Set<string>>(new Set());
    // We use state to trigger re-renders when deletion happens
    const [deletedTick, setDeletedTick] = useState(0);

    // Initialize Deleted IDs
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(DELETED_IDS_KEY);
            if (stored) {
                try {
                    deletedIdsRef.current = new Set(JSON.parse(stored));
                    // Trigger tick to force sync hook to re-filter
                    console.log('[CONTEXT] Loaded deleted IDs from LS. Count:', deletedIdsRef.current.size);
                    setDeletedTick(t => t + 1);
                } catch (e) { }
            }
        }
    }, []);

    const { messages, setMessages, loadMoreMessages, hasMore } = useChatSync(deletedIdsRef, deletedTick);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    // 3. SEND MESSAGE
    const sendMessage = useCallback(async (message: string, image_url?: string, replyTo?: ChatMessage['replyTo']) => {
        if ((!message.trim() && !image_url) || !username) return;

        // Send to Firebase (UI updates via listener)
        push(ref(db, 'chats'), {
            username,
            message,
            image_url: image_url || "",
            photoURL: userImage || "",
            timestamp: serverTimestamp(),
            replyTo: replyTo || null
        });

        // Backup to D1 (Silent)
        api.chat.send({
            room_id: CHAT_ROOM,
            username,
            message,
            photoURL: userImage || ""
        }).catch(e => console.error("D1 Backup failed:", e));

    }, [username, userImage]);

    // 4. SEND REACTION
    const sendReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!username) return;

        // Optimistic Update
        setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) return msg;

            const newReactions = { ...(msg.reactions || {}) };

            // Find existing reaction key by this user for this emoji
            let existingKey = null;
            Object.entries(newReactions).forEach(([key, r]) => {
                if (r.username === username && r.emoji === emoji) {
                    existingKey = key;
                }
            });

            if (existingKey) {
                delete newReactions[existingKey];
            } else {
                const tempKey = `temp-${Date.now()}`;
                newReactions[tempKey] = { username, emoji };
            }

            return { ...msg, reactions: newReactions };
        }));

        // Firebase Write
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

        try {
            const reactionsRef = ref(db, `chats/${messageId}/reactions`);
            if (existingReactionKey) {
                await remove(ref(db, `chats/${messageId}/reactions/${existingReactionKey}`));
            } else {
                await push(reactionsRef, { username, emoji });
            }
        } catch (e) {
            console.error("Failed to sync reaction to Firebase:", e);
        }
    }, [username, messages, setMessages]);

    // 5. DELETE MESSAGE
    const deleteMessage = useCallback(async (messageId: string) => {
        console.log('[DELETE] Attempting to delete:', messageId);
        if (!username) return;

        const idStr = String(messageId);

        // 1. Update Blacklist (Local Persistence)
        if (deletedIdsRef.current) {
            deletedIdsRef.current.add(idStr);
            console.log('[DELETE] Added to blacklist. Size:', deletedIdsRef.current.size);
            if (typeof window !== "undefined") {
                localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIdsRef.current)));
            }
        }

        // Trigger re-render if needed via setDeletedTick, though setMessages below usually handles UI
        setDeletedTick(t => t + 1);

        // 2. Optimistic Update (Filter out immediately)
        setMessages(prev => prev.filter(msg => String(msg.id) !== idStr));

        // 3. Firebase Remove
        try {
            await remove(ref(db, `chats/${messageId}`));
        } catch (e) {
            console.warn("Firebase delete failed (possibly D1 message):", e);
        }

        // 4. D1 Remove
        api.chat.delete({
            room_id: CHAT_ROOM,
            message_id: messageId,
            username
        }).catch(e => console.error("D1 Delete failed:", e));

    }, [username, setMessages]);

    const sendTypingEvent = useCallback(async () => { }, []);

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