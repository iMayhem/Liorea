// src/components/private-chat-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, Loader2, Send, ArrowLeft, CornerDownLeft, Image as ImageIcon } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay, DialogClose } from './ui/dialog';
import { formatDistanceToNowStrict } from 'date-fns';

function formatLastSeen(timestamp: any): string {
    if (!timestamp) return 'Offline';
    // Handle both Firestore Timestamp objects and ISO strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) {
        return 'Offline';
    }

    const now = new Date();
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;

    if (diffSeconds < 60) { // Less than a minute
        return 'Online';
    }
    return `Active ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}


function UserList({ onSelectUser, searchQuery }: { onSelectUser: (user: UserProfile) => void, searchQuery: string }) {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();
  const { newMessagesFrom } = useStudyRoom();

  React.useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUser?.uid || ''));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedUsers: UserProfile[] = [];
        snapshot.forEach(doc => {
            fetchedUsers.push({ ...doc.data(), uid: doc.id } as UserProfile);
        });
        setUsers(fetchedUsers);
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch users:", error);
        setLoading(false);
    });

    return () => unsubscribe();
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
            filteredUsers.map((user) => {
                const lastSeenStatus = formatLastSeen(user.lastSeen);
                const isOnline = lastSeenStatus === 'Online';
                return (
                <button
                    key={user.uid}
                    className="w-full text-left p-3 rounded-md hover:bg-white/10 transition-colors flex items-center gap-4 relative"
                    onClick={() => onSelectUser(user)}
                >
                    <div className="relative">
                        <Avatar>
                            <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'}/>
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"/>}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{user.username}</p>
                        <p className={cn("text-xs", isOnline ? "text-green-400" : "text-muted-foreground")}>{lastSeenStatus}</p>
                    </div>
                    {newMessagesFrom.has(user.uid) && (
                        <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-primary/80 ring-2 ring-background backdrop-blur-sm" />
                    )}
                </button>
                )
            })
        ) : (
            <p className="text-center text-muted-foreground p-4">No users found.</p>
        )}
      </div>
    </ScrollArea>
  );
}

function ChatView({ 
    recipient, 
    onBack,
}: { 
    recipient: UserProfile; 
    onBack: () => void;
}) {
  const { user: sender, profile } = useAuth();
  const [messages, setMessages] = React.useState<PrivateChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = React.useState<{id: string, text: string} | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);


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
    if (!newMessage.trim() || !sender || !profile) return;
    
    const textToSend = newMessage.trim();
    const replyToSend = replyTo;

    setNewMessage('');
    setReplyTo(null);

    await sendPrivateMessage(sender.uid, recipient.uid, textToSend, replyToSend);
  };

  const handleReplyClick = (message: PrivateChatMessage) => {
    setReplyTo({id: message.id, text: message.text || 'Message'});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);


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
        <div>
            <h2 className="text-xl font-bold font-heading">{recipient.username}</h2>
            <p className="text-xs text-muted-foreground">{formatLastSeen(recipient.lastSeen)}</p>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === sender?.uid;
                const originalMessage = msg.replyToId ? findMessageById(msg.replyToId) : null;
                 return (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex flex-col gap-1 group',
                            isCurrentUser ? 'items-end' : 'items-start'
                        )}
                    >
                        <div
                            className={cn(
                            'rounded-xl px-3 py-2 max-w-sm break-words relative bg-black/20 backdrop-blur-sm',
                            isCurrentUser
                                ? 'bg-primary/80 text-primary-foreground'
                                : 'bg-muted/60'
                            )}
                        >
                            {!isCurrentUser && <p className="text-xs font-bold text-primary mb-0.5">
                                {profile?.username === msg.senderName ? "You" : recipient.username}
                            </p>}
                            
                            {originalMessage && (
                                <div className="border-l-2 border-white/50 pl-2 text-xs opacity-80 mb-1 bg-black/20 p-2 rounded-md">
                                    <p className="font-bold">{originalMessage.senderId === sender?.uid ? "You" : recipient.username}</p>
                                    <p className="truncate">{originalMessage.text}</p>
                                </div>
                            )}
                            
                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                            <div className="absolute top-0 flex gap-1 p-1 rounded-full bg-background/20 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={isCurrentUser ? {left: '-8px'} : {right: '-8px'}}>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleReplyClick(msg)}><CornerDownLeft className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </ScrollArea>
       <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
         {replyTo && (
            <div className="text-xs p-2 rounded-md bg-muted/60 w-full flex justify-between items-center">
                <div>
                    <p className="font-bold">Replying to {messages.find(m => m.id === replyTo.id)?.senderId === sender?.uid ? "yourself" : recipient.username}</p>
                    <p className="truncate max-w-xs text-muted-foreground">{replyTo.text}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}><X className="h-4 w-4"/></Button>
            </div>
         )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    ref={inputRef}
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
    </div>
  );
}

export function PrivateChatOverlay() {
  const { isPrivateChatOpen, setIsPrivateChatOpen, clearChatNotification } = useStudyRoom();
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    clearChatNotification(user.uid);
  }

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white"
            >
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/10 z-10"
                onClick={() => setIsPrivateChatOpen(false)}
            >
                <X className="h-8 w-8" />
                <span className="sr-only">Close Private Chat</span>
            </Button>
            
            <motion.div 
              className="w-full max-w-4xl h-full flex flex-col"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.2}}
            >
              {!selectedUser ? (
                <div className="h-full flex flex-col pt-12">
                    <div className="p-4 pt-4 shrink-0 text-center">
                        <div className="relative">
                            <Input
                                placeholder="Search for a user..."
                                className="pl-4 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="p-4 flex-1 overflow-hidden">
                        <UserList onSelectUser={handleSelectUser} searchQuery={searchQuery}/>
                    </div>
                </div>
                ) : (
                <div className="h-full pt-12">
                    <ChatView 
                        recipient={selectedUser} 
                        onBack={() => setSelectedUser(null)}
                    />
                </div>
              )}
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>      
  );
}
