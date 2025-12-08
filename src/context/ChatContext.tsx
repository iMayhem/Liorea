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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { username } = usePresence();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
  
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

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

  const value = useMemo(() => ({
    messages,
    sendMessage,
  }), [messages, sendMessage]);

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
