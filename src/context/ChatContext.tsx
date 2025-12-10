"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePresence } from './PresenceContext';
import { db } from '@/lib/firebase';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove, set } from 'firebase/database';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { username, userImage } = usePresence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // 1. LISTEN LIVE (Firebase onValue handles updates/reactions automatically)
  useEffect(() => {
    const chatRef = query(ref(db, 'chats'), limitToLast(50));
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const loadedMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                ...val,
                id: key,
                // Ensure reactions are handled safely if undefined
                reactions: val.reactions || {} 
            }));
            
            // Sort by timestamp
            loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(loadedMessages);
        } else {
            setMessages([]);
        }
    });

    return () => unsubscribe();
  }, []);

  // 2. SEND MESSAGE
  const sendMessage = useCallback(async (message: string, image_url?: string) => {
    if ((!message.trim() && !image_url) || !username) return;

    // 1. Send to Firebase (Instant)
    push(ref(db, 'chats'), {
        username,
        message,
        image_url: image_url || "",
        photoURL: userImage || "",
        timestamp: serverTimestamp() 
    });

    // 2. Backup to D1
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

      // Find the message locally to check if we already reacted
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;

      // Check if reaction exists by this user with this emoji
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
          // Remove reaction
          remove(ref(db, `chats/${messageId}/reactions/${existingReactionKey}`));
      } else {
          // Add reaction
          push(reactionsRef, {
              username,
              emoji
          });
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