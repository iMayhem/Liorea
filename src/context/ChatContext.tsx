"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { usePresence } from './PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, onChildAdded, query, orderByChild, startAfter, limitToLast, serverTimestamp } from 'firebase/database';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const CHAT_ROOM = "study-room-1";

export interface ChatMessage {
  id?: string | number;
  username: string;
  message: string;
  timestamp: number;
  photoURL?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  sendTypingEvent: () => void;
  typingUsers: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { username, userImage } = usePresence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const lastLoadedTimestamp = useRef<number>(0);
  const isHistoryLoaded = useRef(false);

  // 1. LOAD HISTORY (D1)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}`);
        if (res.ok) {
          const historyData: ChatMessage[] = await res.json();
          if (historyData.length > 0) {
            setMessages(historyData);
            const lastMsg = historyData[historyData.length - 1];
            if (lastMsg.timestamp) {
                lastLoadedTimestamp.current = lastMsg.timestamp;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load D1 history:", error);
      } finally {
        isHistoryLoaded.current = true;
        startFirebaseListener(); 
      }
    };

    loadHistory();
  }, []);

  // 2. LISTEN LIVE (Firebase)
  const startFirebaseListener = useCallback(() => {
    const chatRef = ref(db, 'chats');
    
    const q = isHistoryLoaded.current && lastLoadedTimestamp.current > 0
        ? query(chatRef, orderByChild('timestamp'), startAfter(lastLoadedTimestamp.current))
        : query(chatRef, limitToLast(50));

    const unsubscribe = onChildAdded(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setMessages((prev) => {
                const exists = prev.some(m => Math.abs(m.timestamp - data.timestamp) < 500 && m.message === data.message);
                if (exists) return prev;
                return [...prev, { ...data, id: snapshot.key }];
            });
        }
    });

    return unsubscribe;
  }, []);

  // 3. SEND MESSAGE
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !username) return;

    // 1. Send to Firebase (Instant)
    push(ref(db, 'chats'), {
        username,
        message,
        photoURL: userImage || "",
        timestamp: serverTimestamp() 
    });

    // 2. Backup to Cloudflare D1 (Permanent)
    fetch(`${WORKER_URL}/chat/send`, {
        method: "POST",
        // UPDATED: Now sending photoURL to the worker
        body: JSON.stringify({ 
            room_id: CHAT_ROOM, 
            username, 
            message, 
            photoURL: userImage || "" 
        }),
        headers: { "Content-Type": "application/json" }
    }).catch(e => console.error("D1 Backup failed:", e));

  }, [username, userImage]);
  
  const sendTypingEvent = useCallback(async () => {}, []);

  const value = useMemo(() => ({
    messages, sendMessage, typingUsers, sendTypingEvent,
  }), [messages, sendMessage, typingUsers, sendTypingEvent]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat error');
  return context;
};