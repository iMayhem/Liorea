// src/components/private-chat-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { X, Loader2, Send, ArrowLeft, Search, Image as ImageIcon, CornerDownLeft } from 'lucide-react';
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
import { ChatIcon } from './icons';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal, DialogOverlay, DialogClose } from './ui/dialog';

interface PrivateChatOverlayProps {}

function UserList({ onSelectUser, searchQuery }: { onSelectUser: (user: UserProfile) => void, searchQuery: string }) {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();
  const { newMessagesFrom } = useStudyRoom();

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
                className="w-full text-left p-3 rounded-md hover:bg-white/10 transition-colors flex items-center gap-4 relative"
                onClick={() => onSelectUser(user)}
            >
                <Avatar>
                <AvatarImage src={user.photoURL || ''} alt={user.username || 'User'}/>
                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                </div>
                 {newMessagesFrom.has(user.uid) && (
                     <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-primary/80 ring-2 ring-background backdrop-blur-sm" />
                )}
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
  const { user: sender, profile } = useAuth();
  const [messages, setMessages] = React.useState<PrivateChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [image, setImage] = React.useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
    if (!newMessage.trim() && !image || !sender || !profile) return;
    
    const textToSend = newMessage.trim();
    const imageToSend = image;
    const replyToSend = replyTo;

    setNewMessage('');
    setImage(null);
    setReplyTo(null);

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: PrivateChatMessage = {
      id: tempId,
      text: textToSend,
      imageUrl: imageToSend,
      senderId: sender.uid,
      receiverId: recipient.uid,
      timestamp: new Date(),
       ...(replyToSend && { replyToId: replyToSend.id, replyToText: replyToSend.text }),
    };
    setMessages(prev => [...prev, optimisticMessage]);


    await sendPrivateMessage(sender.uid, recipient.uid, textToSend, imageToSend, replyToSend);
    // The real message will replace the optimistic one via the onSnapshot listener.
  };

  const handleReplyClick = (message: PrivateChatMessage) => {
    setReplyTo({id: message.id, text: message.text || 'Image'});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if(file){
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
            event.preventDefault();
            return;
        }
    }
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
                                {profile?.username === msg.senderName ? "You" : msg.senderName}
                            </p>}
                            
                            {originalMessage && (
                                <div className="border-l-2 border-white/50 pl-2 text-xs opacity-80 mb-1 bg-black/20 p-2 rounded-md">
                                    <p className="font-bold">{originalMessage.senderId === sender?.uid ? "You" : recipient.username}</p>
                                    <p className="truncate">{originalMessage.text || 'Image'}</p>
                                </div>
                            )}

                             {msg.imageUrl && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-auto w-auto p-2 rounded-lg bg-black/20 hover:bg-black/30 my-1">
                                            <ImageIcon className="h-10 w-10" />
                                        </Button>
                                    </DialogTrigger>
                                     <DialogPortal>
                                        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
                                        <DialogContent className="p-0 border-0 max-w-4xl bg-transparent shadow-none">
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Image from {msg.senderId === sender?.uid ? "You" : recipient.username}</DialogTitle>
                                            </DialogHeader>
                                            <Image src={msg.imageUrl} alt="chat image" width={1000} height={1000} className="w-full h-auto object-contain rounded-lg"/>
                                        </DialogContent>
                                    </DialogPortal>
                                </Dialog>
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
          {image && (
            <div className="relative p-2 rounded-md bg-muted/60 w-full">
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                    <Image src={image} alt="preview" fill={true} style={{objectFit: 'cover'}} />
                </div>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => setImage(null)}><X className="h-4 w-4"/></Button>
            </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Type a message..."
                    className="bg-background/50"
                />
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4" />
                    <span className="sr-only">Add Image</span>
                </Button>
                <Button type="submit" size="icon">
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
       </div>
    </div>
  );
}

export function PrivateChatOverlay(props: PrivateChatOverlayProps) {
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
        <Dialog open={isPrivateChatOpen} onOpenChange={setIsPrivateChatOpen}>
            <DialogPortal>
                <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
                <DialogContent 
                    className="w-full max-w-4xl h-[90vh] max-h-[700px] bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-0 flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogClose className="sr-only" />
                    {!selectedUser ? (
                    <div className="h-full flex flex-col">
                        <DialogHeader className="p-4 border-b border-white/10 shrink-0 text-center">
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for a user..."
                                className="pl-10 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        </DialogHeader>
                        <div className="p-4 flex-1 overflow-hidden">
                        <UserList onSelectUser={handleSelectUser} searchQuery={searchQuery}/>
                        </div>
                    </div>
                    ) : (
                    <div className="h-full">
                        <ChatView recipient={selectedUser} onBack={() => setSelectedUser(null)} />
                    </div>
                    )}
                </DialogContent>
            </DialogPortal>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
