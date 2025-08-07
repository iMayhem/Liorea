// src/components/group-chat.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, CornerDownLeft, X, SmilePlus, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';


interface GroupChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: { text: string; imageUrl?: string | null }, replyTo: { id: string; text: string } | null) => void;
  currentUserId: string;
  onReaction: (messageId: string, emoji: string) => void;
  onTyping: (text: string) => void;
  typingUsers: { [uid: string]: { username: string; text: string } };
}

const EMOJIS = ['👍', '😂', '❤️', '🤔', '🎉', '✨', '😢', '🔥', '🌧️', '❄️', '🤯', '🙏'];

export function GroupChat({ messages, onSendMessage, currentUserId, onReaction, onTyping, typingUsers }: GroupChatProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<{id: string, text: string} | null>(null);
  const [image, setImage] = React.useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const debouncedStopTyping = useDebouncedCallback(
    () => {
      onTyping('');
    },
    2000, // 2 second delay after user stops typing
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    onTyping(text); 
    debouncedStopTyping();
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || image) {
      onSendMessage({ text: newMessage.trim(), imageUrl: image }, replyTo);
      debouncedStopTyping.cancel();
      onTyping(''); // Immediately clear typing indicator on send
      setNewMessage('');
      setReplyTo(null);
      setImage(null);
    }
  };

  const handleReplyClick = (message: ChatMessage) => {
    setReplyTo({id: message.id, text: message.text});
    inputRef.current?.focus();
  }

  const findMessageById = (id: string) => messages.find(m => m.id === id);
  
  const activeTypers = React.useMemo(() => 
    Object.entries(typingUsers)
    .filter(([uid, { text }]) => uid !== currentUserId && text.trim() !== '')
    .map(([uid, { username, text }]) => ({ uid, username, text })),
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


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5"/>
            Group Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="pr-4 space-y-4">
             <AnimatePresence>
                {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    const originalMessage = msg.replyToId ? findMessageById(msg.replyToId) : null;
                    return (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
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
                                    <p className="truncate">{originalMessage.text}</p>
                                </div>
                            )}

                             {msg.imageUrl && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative h-48 w-full my-2 rounded-md overflow-hidden cursor-pointer">
                                            <Image src={msg.imageUrl} alt="chat image" layout="fill" objectFit="cover" />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 border-0 max-w-4xl">
                                        <Image src={msg.imageUrl} alt="chat image" width={1000} height={1000} className="w-full h-auto object-contain"/>
                                    </DialogContent>
                                </Dialog>
                            )}
                            
                            {msg.text && <p className="text-sm">{msg.text}</p>}

                            <div className="absolute top-0 flex gap-1 p-1 rounded-full bg-background/20 backdrop-blur-sm -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={isCurrentUser ? {left: '-8px'} : {right: '-8px'}}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6"><SmilePlus className="h-4 w-4"/></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1">
                                        <div className="grid grid-cols-6 gap-1">
                                            {EMOJIS.map(emoji => (
                                                <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 text-lg" onClick={() => onReaction(msg.id, emoji)}>{emoji}</Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleReplyClick(msg)}><CornerDownLeft className="h-4 w-4"/></Button>
                            </div>
                            
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {Object.entries(msg.reactions).map(([emoji, users]) => users.length > 0 && (
                                        <div key={emoji} className={cn("px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 cursor-pointer", users.includes(currentUserId) ? 'bg-blue-500/50' : 'bg-muted/50')} onClick={() => onReaction(msg.id, emoji)}>
                                            <span>{emoji}</span>
                                            <span>{users.length}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                    )
                })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 pt-2 flex-col items-start gap-1">
         <div className="h-6 text-sm text-muted-foreground italic w-full overflow-y-auto">
            {activeTypers.map(({ uid, username, text }) => (
                <div key={uid} className="truncate">
                    <span className="font-semibold">{username}:</span> {text}
                </div>
            ))}
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
                <Image src={image} alt="preview" layout="fill" objectFit="cover" />
            </div>
            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => setImage(null)}><X className="h-4 w-4"/></Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
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
