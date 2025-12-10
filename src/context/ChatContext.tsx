"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePresence } from './PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove } from 'firebase/database';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const CHAT_ROOM = "study-room-1";
const LOCAL_STORAGE_KEY = 'liorea_chat_history';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { username, userImage } = usePresence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // 1. HYBRID FETCH: Local Storage + Delta API + Firebase
  useEffect(() => {
    const loadMessages = async () => {
        let initialMessages: ChatMessage[] = [];
        let sinceTimestamp = 0;

        // A. Load from Local Storage (Client Logic)
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                try {
                    initialMessages = JSON.parse(stored);
                    if (initialMessages.length > 0) {
                        // Get the latest timestamp we have
                        sinceTimestamp = initialMessages[initialMessages.length - 1].timestamp;
                    }
                } catch (e) { console.error("Cache parse error", e); }
            }
        }

        // B. Fetch Delta from D1 (Delta Fetching)
        // Only fetch messages NEWER than what we have locally
        try {
            const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}&since=${sinceTimestamp}`);
            if (res.ok) {
                const newMessages: ChatMessage[] = await res.json();
                
                // Merge Logic: Filter out duplicates based on ID or Timestamp
                const existingIds = new Set(initialMessages.map(m => m.id));
                const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
                
                initialMessages = [...initialMessages, ...uniqueNewMessages];
                
                // Keep Local Storage manageable (e.g., last 200)
                if (initialMessages.length > 200) {
                    initialMessages = initialMessages.slice(initialMessages.length - 200);
                }
                
                // Save updated history
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMessages));
                setMessages(initialMessages);
            }
        } catch (e) {
            console.error("D1 Delta fetch failed", e);
            setMessages(initialMessages); // Fallback to local
        }

        // C. Start Firebase Live Listener (For real-time updates)
        // We only listen to the very latest to avoid re-downloading everything
        const chatRef = query(ref(db, 'chats'), limitToLast(20));
        
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages((prev) => {
                    const liveMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                        ...val,
                        id: key,
                        reactions: val.reactions || {} 
                    }));

                    // Intelligent Merge:
                    // 1. Add new messages that aren't in 'prev'
                    // 2. Update existing messages if reactions changed
                    const msgMap = new Map(prev.map(m => [m.id, m]));
                    
                    liveMessages.forEach(newMsg => {
                        msgMap.set(newMsg.id, newMsg); // Adds or Overwrites
                    });

                    const merged = Array.from(msgMap.values()).sort((a, b) => a.timestamp - b.timestamp);
                    
                    // Update Local Storage with the freshest state
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged.slice(-200)));
                    return merged;
                });
            }
        });

        return () => unsubscribe();
    };

    loadMessages();
  }, []);

  // 2. SEND MESSAGE
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

  // 3. SEND REACTION
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
    messages, sendMessage, sendReaction, typingUsers, sendTypingEvent,
  }), [messages, sendMessage, sendReaction, typingUsers, sendTypingEvent]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat error');
  return context;
};