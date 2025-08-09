// src/components/private-chat-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, Loader2, Send, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile, PrivateChatMessage } from '@/lib/types';
import { getAllUsers, sendPrivateMessage } from '@/lib/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useStudyRoom } from '@/hooks/use-study-room';

interface PrivateChatOverlayProps {}

function UserList({ onSelectUser, searchQuery }: { onSelectUser: (user: UserProfile) => void, searchQuery: string }) {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();

  React.useEffect(() => {
    const fetchUsers = async () => {
        try {
            const allUsers = await getAllUsers();
            // Filter out the current user from the list
            setUsers(allUsers.filter((u) => u.uid !== currentUser?.uid));
        } catch(error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchUsers();
  }, [currentUser]);

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) {
        return users;
    }
    return users.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
            <button
                key={user.uid}
                className="w-full text-left p-3 rounded-md hover:bg-white/10 transition-colors flex items-center gap-4"
                onClick={() => onSelectUser(user)}
            >
                <Avatar>
                <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'}/>
                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{user.username}</p>
                </div>
            </button>
            ))
        ) : (
            <p className="text-center text-muted-foreground p-4">No users found.</p>
        )}
      </div>
    </ScrollArea>
  );
}

function ChatView({ recipient, onBack }: { recipient: UserProfile; onBack: () => void }) {
  const { user: sender } = useAuth();
  const [messages, setMessages] = React.useState<PrivateChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const getChatRoomId = React.useCallback((uid1: string, uid2: string) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }, []);

  React.useEffect(() => {
    if (!sender || !recipient) return;

    const chatRoomId = getChatRoomId(sender.uid, recipient.uid);
    const messagesRef = collection(db, 'privateChats', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: PrivateChatMessage[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as PrivateChatMessage);
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [sender, recipient, getChatRoomId]);

  React.useEffect(() => {
    // Scroll to bottom on new messages
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sender) return;

    await sendPrivateMessage(sender.uid, recipient.uid, newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b border-white/10 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft />
        </Button>
        <Avatar>
            <AvatarImage src={recipient.photoURL || ''} alt={recipient.username || 'User'}/>
            <AvatarFallback>{recipient.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold font-heading">{recipient.username}</h2>
      </header>
      <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        'flex flex-col gap-1',
                        msg.senderId === sender?.uid ? 'items-end' : 'items-start'
                    )}
                >
                    <div
                        className={cn(
                        'rounded-lg px-3 py-2 max-w-xs break-words',
                        msg.senderId === sender?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex items-center gap-2">
        <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-background/50"
        />
        <Button type="submit" size="icon">
            <Send className="h-4 w-4"/>
        </Button>
      </form>
    </div>
  );
}

export function PrivateChatOverlay(props: PrivateChatOverlayProps) {
  const { isPrivateChatOpen, setIsPrivateChatOpen } = useStudyRoom();
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Reset when overlay is closed
  React.useEffect(() => {
    if (!isPrivateChatOpen) {
      setSelectedUser(null);
      setSearchQuery('');
    }
  }, [isPrivateChatOpen]);

  return (
    <AnimatePresence>
      {isPrivateChatOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10"
            onClick={() => setIsPrivateChatOpen(false)}
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Close Chat</span>
          </Button>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl h-[90vh] max-h-[700px] bg-background/80 rounded-2xl border border-white/10 shadow-lg"
          >
            {!selectedUser ? (
                <div className="h-full flex flex-col">
                    <header className="p-4 border-b border-white/10">
                        <h1 className="text-2xl font-bold font-heading text-center mb-4">Private Chat</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for a user..."
                                className="pl-10 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </header>
                    <div className="p-4 flex-1 overflow-hidden">
                        <UserList onSelectUser={setSelectedUser} searchQuery={searchQuery}/>
                    </div>
                </div>
            ) : (
                <ChatView recipient={selectedUser} onBack={() => setSelectedUser(null)} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
