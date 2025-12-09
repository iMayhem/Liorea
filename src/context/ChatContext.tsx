
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePresence } from './PresenceContext';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const CHAT_ROOM = "study-room-1";

export interface ChatMessage {
  username: string;
  message: string;
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

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}/chat/history?room=${CHAT_ROOM}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, []);

  const checkTypingUsers = useCallback(async () => {
    if (!username) return;
    try {
      const res = await fetch(`${WORKER_URL}/chat/typing?room=${CHAT_ROOM}`);
      if (res.ok) {
        const data: { username: string }[] = await res.json();
        // Filter out the current user's name
        setTypingUsers(data.map(u => u.username).filter(name => name !== username));
      }
    } catch (error) {
      console.error("Failed to check typing users:", error);
    }
  }, [username]);
  
  useEffect(() => {
    loadMessages();
    checkTypingUsers();
    const messageInterval = setInterval(loadMessages, 2000);
    const typingInterval = setInterval(checkTypingUsers, 1500);
    return () => {
        clearInterval(messageInterval);
        clearInterval(typingInterval);
    }
  }, [loadMessages, checkTypingUsers]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !username) return;

    try {
      await fetch(`${WORKER_URL}/chat/send`, {
        method: "POST",
        body: JSON.stringify({ room_id: CHAT_ROOM, username, message }),
        headers: { "Content-Type": "application/json" }
      });
      // Refresh messages immediately after sending
      loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [username, loadMessages]);
  
  const sendTypingEvent = useCallback(async () => {
    if (!username) return;
    try {
        await fetch(`${WORKER_URL}/chat/typing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: CHAT_ROOM, username }),
        });
    } catch (error) {
        console.error('Failed to send typing event:', error);
    }
  }, [username]);

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
