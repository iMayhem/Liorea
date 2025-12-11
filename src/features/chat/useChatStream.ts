import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, query, limitToLast } from 'firebase/database';
import { api } from '@/lib/api';

export function useChatStream(path: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Subscribe to Firebase
  useEffect(() => {
    setLoading(true);
    const chatRef = query(ref(db, path), limitToLast(50));
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          ...val,
          id: key,
        }));
        setMessages(list); // Firebase is already time-sorted usually, or sort here
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  // 2. Send Function
  const sendMessage = useCallback(async (user: string, text: string, img?: string, photoURL?: string) => {
    // A. Send to Firebase (Instant)
    await push(ref(db, path), {
      username: user,
      message: text,
      image_url: img || "",
      photoURL: photoURL || "",
      timestamp: serverTimestamp()
    });

    // B. Backup to D1 (Async/Background)
    // We assume the path is like "chats/room-id"
    const roomId = path.split('/').pop() || "general"; 
    api.chat.backupMessage({
        room_id: roomId,
        username: user,
        message: text,
        photoURL
    }).catch(console.error);
    
  }, [path]);

  return { messages, loading, sendMessage };
}