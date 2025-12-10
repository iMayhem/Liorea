"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePresence } from './PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove } from 'firebase/database';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const CHAT_ROOM = "study-room-1";

export interface ChatReaction {
  id?: string;
  username: string;
  emoji: string;
}

export interface ChatMessage {
  id: string;
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

  // 1. INITIAL LOAD (Latest 20) & LIVE UPDATES
  useEffect(() => {
    // A. Fetch initial 20 from Worker to populate immediately (optional, but faster than Firebase cold start)
    const fetchInitial = async () => {
        try {
            const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) { console.error(e); }
    };
    fetchInitial();

    // B. Firebase Live Listener (New messages)
    const chatRef = query(ref(db, 'chats'), limitToLast(20));
    const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const liveMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                ...val,
                id: key,
                reactions: val.reactions || {} 
            }));

            // Merge logic: Live messages always win over static ones
            setMessages((prev) => {
                const msgMap = new Map(prev.map(m => [m.id, m]));
                liveMessages.forEach(newMsg => msgMap.set(newMsg.id, newMsg));
                return Array.from(msgMap.values()).sort((a, b) => a.timestamp - b.timestamp);
            });
        }
    });

    return () => unsubscribe();
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
                  setMessages(prev => [...olderMessages, ...prev]);
              }
          }
      } catch (e) { console.error("Load more failed", e); }
      finally { setLoadingMore(false); }
  }, [messages, loadingMore, hasMore]);

  // 3. SEND MESSAGE
  const sendMessage = useCallback(async (message: string, image_url?: string) => {
    if ((!message.trim() && !image_url) || !username) return;

    // Send to Firebase
    push(ref(db, 'chats'), {
        username,
        message,
        image_url: image_url || "",
        photoURL: userImage || "",
        timestamp: serverTimestamp() 
    });

    // Backup to D1
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
  
  const sendTypingEvent = useCallback(async () => {}, []);

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