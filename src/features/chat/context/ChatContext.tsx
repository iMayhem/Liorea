"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, remove, serverTimestamp, update } from 'firebase/database';

import { api } from '@/lib/api';
import { CHAT_ROOM, DELETED_IDS_KEY } from '@/lib/constants';
import { ChatMessage, ChatReaction } from '../types';
import { useChatSync } from '../hooks/useChatSync';

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

    const { messages, setMessages, loadMoreMessages, hasMore } = useChatSync(roomId);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    // 3. SEND MESSAGE
    const sendMessage = useCallback(async (message: string, image_url?: string, replyTo?: ChatMessage['replyTo']) => {
        if ((!message.trim() && !image_url) || !username) return;

        // Send to Firebase (UI updates via listener)
        push(ref(db, `rooms/${roomId}/chats`), {
            username,
            message,
            image_url: image_url || "",
            photoURL: userImage || "",
            timestamp: serverTimestamp(),
            replyTo: replyTo || null
        });

        // Backup to D1 (Silent)
        api.chat.send({
            room_id: roomId,
            username,
            message,
            photoURL: userImage || ""
        }).catch(e => console.error("D1 Backup failed:", e));

    }, [username, userImage, roomId]);

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
            const reactionsRef = ref(db, `rooms/${roomId}/chats/${messageId}/reactions`);
            if (existingReactionKey) {
                await remove(ref(db, `rooms/${roomId}/chats/${messageId}/reactions/${existingReactionKey}`));
            } else {
                await push(reactionsRef, { username, emoji });
            }
        } catch (e) {
            console.error("Failed to sync reaction to Firebase:", e);
        }
    }, [username, messages, setMessages, roomId]);

    // 5. DELETE MESSAGE (Real-time with Tombstone)
    const deleteMessage = useCallback(async (messageId: string) => {
        if (!username) return;

        // 1. Optimistic Update
        setMessages(prev => prev.filter(msg => String(msg.id) !== String(messageId)));

        // 2. Firebase Tombstone (Soft Delete for specific real-time propagation)
        // We update the node to have { deleted: true } so other clients can filter it out
        try {
            await update(ref(db, `rooms/${roomId}/chats/${messageId}`), { deleted: true });
        } catch (e) {
            console.error("Firebase delete failed:", e);
        }

        // 3. D1 Remove (Permanent)
        api.chat.delete({
            room_id: roomId,
            message_id: messageId,
            username
        }).catch(e => console.error("D1 Delete failed:", e));

    }, [username, setMessages, roomId]);

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