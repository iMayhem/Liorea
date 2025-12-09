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
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  sendTypingEvent: () => void;
  typingUsers: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { username } = usePresence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Track the timestamp of the last loaded message to bridge History and Live
  const lastLoadedTimestamp = useRef<number>(0);
  const isHistoryLoaded = useRef(false);

  // 1. LOAD HISTORY (From Cloudflare D1 - Cheap & Big Storage)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}`);
        if (res.ok) {
          const historyData: ChatMessage[] = await res.json();
          
          if (historyData.length > 0) {
            setMessages(historyData);
            // Update our tracker so we don't duplicate these from Firebase
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
        // Start listening to Firebase ONLY after history checks are done
        startFirebaseListener(); 
      }
    };

    loadHistory();
  }, []);

  // 2. LISTEN LIVE (From Firebase - Instant Speed)
  const startFirebaseListener = useCallback(() => {
    // We only want new messages that come AFTER our D1 history
    const chatRef = ref(db, 'chats');
    // If we have history, start after it. If not, just get the last 1.
    const q = isHistoryLoaded.current && lastLoadedTimestamp.current > 0
        ? query(chatRef, orderByChild('timestamp'), startAfter(lastLoadedTimestamp.current))
        : query(chatRef, limitToLast(1));

    const unsubscribe = onChildAdded(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setMessages((prev) => {
                // Deduplication check: Ensure we don't add the same message twice
                // (Comparing by timestamp + username is usually unique enough for chat)
                const exists = prev.some(m => m.timestamp === data.timestamp && m.message === data.message);
                if (exists) return prev;
                return [...prev, { ...data, id: snapshot.key }];
            });
        }
    });

    return unsubscribe; // Cleanup function not returned here directly due to useEffect structure below
  }, []);


  // 3. SEND MESSAGE (Write to Both)
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !username) return;

    const timestamp = Date.now();
    const msgData = { username, message, timestamp };

    // A. Send to Firebase (For Instant UI updates for everyone)
    // This triggers the 'onChildAdded' above immediately
    push(ref(db, 'chats'), {
        ...msgData,
        timestamp: serverTimestamp() // Use server time for ordering
    });

    // B. Send to Cloudflare D1 (For Long-term Storage)
    // We do this silently in the background. Even if it fails, the chat works.
    fetch(`${WORKER_URL}/chat/send`, {
        method: "POST",
        body: JSON.stringify({ room_id: CHAT_ROOM, username, message }),
        headers: { "Content-Type": "application/json" }
    }).catch(e => console.error("Background backup failed:", e));

  }, [username]);
  
  // Mock typing for now
  const sendTypingEvent = useCallback(async () => {}, []);

  const value = useMemo(() => ({
    messages,
    sendMessage,
    typingUsers,
    sendTypingEvent,
  }), [messages, sendMessage, typingUsers, sendTypingEvent]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};