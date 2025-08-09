// src/components/group-chat.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, CornerDownLeft, X, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '@/hooks/use-auth';

interface GroupChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: { text: string; imageUrl?: string | null }, replyTo: { id: string, text: string } | null) => void;
  currentUserId: string;
  onTyping: (isTyping: boolean) => void;
  typingUsers: { [uid: string]: string };
}

export function GroupChat({ messages: initialMessages, onSendMessage, currentUserId, onTyping, typingUsers }: GroupChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<{id: string, text: string} | null>(null);
  const [image, setImage] = React.useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = React.useRef(initialMessages.length);
  const { profile } = useAuth();


  React.useEffect(() => {
    // Sync with external messages, but prioritize local state for smooth updates
    setMessages(initialMessages);

    // Check for new incoming messages to play notification sound
    if (initialMessages.length > prevMessagesLengthRef.current) {
        const lastMessage = initialMessages[initialMessages.length - 1];
        // Play sound only for incoming messages, not for messages sent by the current user
        if (lastMessage && lastMessage.senderId !== currentUserId) {
            const notificationSound = document.getElementById('chat-notification-sound') as HTMLAudioElement;
            if (notificationSound) {
                notificationSound.play().catch(error => console.error("Error playing notification sound:", error));
            }
        }
    }
    
    prevMessagesLengthRef.current = initialMessages.length;

  }, [initialMessages, currentUserId]);

  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);
  
  const debouncedStopTyping = useDebouncedCallback(
    () => {
      onTyping(false);
    },
    2000, // 2 second delay after user stops typing
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    if (text) {
        onTyping(true);
        debouncedStopTyping();
    } else {
        onTyping(false);
        debouncedStopTyping.cancel();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.username) return;

    if (newMessage.trim() || image) {
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        text: newMessage.trim(),
        imageUrl: image,
        senderId: currentUserId,
        senderName: profile.username, 
        timestamp: new Date(),
        ...(replyTo && { replyToId: replyTo.id, replyToText: replyTo.text }),
      };

      // Optimistic UI update
      setMessages(prev => [...prev, optimisticMessage]);
      onSendMessage({ text: newMessage.trim(), imageUrl: image }, replyTo);
      debouncedStopTyping.cancel();
      onTyping(false); // Immediately clear typing indicator on send
      setNewMessage('');
      setReplyTo(null);
      setImage(null);
    }
  };

  const handleReplyClick = (message: ChatMessage) => {
    setReplyTo({id: message.id, text: message.text || 'Image'});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);
  
  const activeTypers = React.useMemo(() => 
    Object.entries(typingUsers)
    .filter(([uid]) => uid !== currentUserId)
    .map(([, username]) => username),
  [typingUsers, currentUserId]);


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
    <Card className="h-full flex flex-col bg-background/80">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5"/>
            Group Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="pr-4 space-y-4">
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUserId;
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
                        'rounded-lg px-3 py-2 max-w-xs break-words relative',
                        isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p className="text-xs font-semibold text-muted-foreground/80 mb-0.5">
                            {isCurrentUser ? 'You' : msg.senderName}
                        </p>
                        
                        {originalMessage && (
                            <div className="border-l-2 border-blue-300 pl-2 text-xs opacity-80 mb-1">
                                <p className="font-bold">{originalMessage.senderName}</p>
                                <p className="truncate">{originalMessage.text || 'Image'}</p>
                            </div>
                        )}

                         {msg.imageUrl && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative h-48 w-full my-2 rounded-md overflow-hidden cursor-pointer">
                                        <Image src={msg.imageUrl} alt="chat image" fill={true} style={{objectFit: 'cover'}} />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="p-0 border-0 max-w-4xl">
                                     <DialogHeader>
                                        <DialogTitle className="sr-only">Image from {msg.senderName}</DialogTitle>
                                     </DialogHeader>
                                    <Image src={msg.imageUrl} alt="chat image" width={1000} height={1000} className="w-full h-auto object-contain"/>
                                </DialogContent>
                            </Dialog>
                        )}
                        
                        {msg.text && <p className="text-sm">{msg.text}</p>}

                        <div className="absolute top-0 flex gap-1 p-1 rounded-full bg-background/20 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={isCurrentUser ? {left: '-8px'} : {right: '-8px'}}>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleReplyClick(msg)}><CornerDownLeft className="h-4 w-4"/></Button>
                        </div>
                        
                    </div>
                </div>
                )
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 pt-2 flex-col items-start gap-1">
         <div className="h-6 text-sm text-muted-foreground italic w-full overflow-hidden">
             {activeTypers.length > 0 && (
                <p className="truncate">
                    {activeTypers.join(', ')} {activeTypers.length === 1 ? 'is' : 'are'} typing...
                </p>
            )}
        </div>
         {replyTo && (
            <div className="text-xs p-2 rounded-md bg-muted w-full flex justify-between items-center">
                <div>
                    <p className="font-bold">Replying to a message</p>
                    <p className="truncate max-w-xs text-muted-foreground">{replyTo.text}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}><X className="h-4 w-4"/></Button>
            </div>
         )}
        {image && (
          <div className="relative p-2 rounded-md bg-muted w-full">
            <div className="relative w-24 h-24 rounded-md overflow-hidden">
                <Image src={image} alt="preview" fill={true} style={{objectFit: 'cover'}} />
            </div>
            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => setImage(null)}><X className="h-4 w-4"/></Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onPaste={handlePaste}
            placeholder="Type your message..."
            autoComplete="off"
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
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
