// src/app/jamnight/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Music, Clipboard, Send, Search, Video, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, collection, addDoc, query, orderBy, deleteField, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatMessage, Participant, UserProfile, JamRoomState } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';
import { Label } from '@/components/ui/label';
import { updateUserProfile, getUserProfile } from '@/lib/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { searchYoutube } from '@/ai/flows/youtube-search';
import type { YoutubeSearchOutput } from '@/lib/types/youtube';
import { ScrollArea } from '@/components/ui/scroll-area';

function YouTubeSearch({ onSelectVideo }: { onSelectVideo: (videoId: string) => void }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<YoutubeSearchOutput['videos']>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchYoutube({ query: searchQuery });
            setSearchResults(results.videos);
        } catch (error) {
            console.error("YouTube search failed:", error);
            toast({ title: "Search Error", description: "Could not fetch YouTube videos.", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Find a Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search for a YouTube video..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
                 {searchResults.length > 0 && (
                    <ScrollArea className="h-72">
                        <div className="space-y-2">
                            {searchResults.map(video => (
                                <div key={video.videoId} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => onSelectVideo(video.videoId)}>
                                    <Image src={video.thumbnail} alt={video.title} width={80} height={60} className="rounded-md"/>
                                    <p className="text-sm font-medium leading-tight">{video.title}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                 )}
            </CardContent>
        </Card>
    );
}

export default function JamRoomPage({ params }: { params: { roomId: string } }) {
    const { roomId } = React.use(params as any);
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [roomState, setRoomState] = React.useState<JamRoomState | null>(null);
    const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
    
    // Firestore update function
    const updateRoomState = React.useCallback(async (newState: Partial<JamRoomState>) => {
        if (!roomId) return;
        const roomRef = doc(db, 'jamRooms', roomId);
        await updateDoc(roomRef, newState);
    }, [roomId]);

    // Effect to handle joining/leaving the room and listening for state changes
    React.useEffect(() => {
        if (authLoading || !user || !profile) return;

        const roomRef = doc(db, 'jamRooms', roomId);
        const chatQuery = query(collection(db, 'jamRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));

        const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
            if (!docSnap.exists()) {
                toast({ title: "Error", description: "Jam room not found.", variant: "destructive" });
                router.push('/jamnight');
                return;
            }

            const roomData = docSnap.data() as JamRoomState;
            setRoomState(roomData);

             if (!roomData.participants?.some((p: Participant) => p.uid === user.uid)) {
                updateDoc(roomRef, { 
                    participants: arrayUnion({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }) 
                });
            }
            updateUserProfile(user.uid, { status: { isStudying: false, isJamming: true, roomId: roomId } });
        });

        const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        // This is a simplified cleanup. For a robust app, you might use `beforeunload` event.
        return () => {
            unsubscribeRoom();
            unsubscribeChat();
            if (user && profile) {
                getDoc(doc(db, 'jamRooms', roomId)).then(docSnap => {
                    if(docSnap.exists()) {
                        updateDoc(docSnap.ref, { 
                            participants: arrayRemove({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }),
                        });
                    }
                })
                updateUserProfile(user.uid, { status: { isStudying: false, isJamming: false, roomId: null } });
            }
        };

    }, [roomId, user, profile, authLoading, router, toast]);
    
     const handleSendMessage = async (message: {text: string}, replyTo: { id: string, text: string } | null) => {
        if (!user || !profile?.username || !roomId) return;
        const chatCollectionRef = collection(db, 'jamRooms', roomId, 'chats');
        
        if(!message.text) return;

        const messageData: any = {
          text: message.text,
          senderId: user.uid,
          senderName: profile.username,
          timestamp: serverTimestamp(),
        };

        if (replyTo) {
          messageData.replyToId = replyTo.id;
          messageData.replyToText = replyTo.text;
        }
        
        await addDoc(chatCollectionRef, messageData);
    };

    const handleTyping = async (isTyping: boolean) => {
        // Typing indicator can be re-enabled if needed, but keeping it simple for now.
    };
    
    const handleSelectVideo = (videoId: string) => {
        if(videoId) {
            updateRoomState({ currentVideoId: videoId });
        }
    };

    if (authLoading || !roomState || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:h-[55vh]">
                <div className="lg:col-span-2">
                  <Card className="w-full h-full flex flex-col overflow-hidden">
                    <YouTube
                      videoId={roomState.currentVideoId}
                      opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: {
                          autoplay: 1,
                          controls: 1,
                          rel: 0, // This is the key change
                        },
                      }}
                      className="w-full h-full flex-grow"
                      key={roomState.currentVideoId}
                    />
                  </Card>
                </div>
                <div className="lg:col-span-1 h-full min-h-[400px] lg:min-h-0">
                  <GroupChat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    currentUserId={user!.uid}
                    onTyping={handleTyping}
                    typingUsers={roomState.typingUsers || {}}
                  />
                </div>
            </div>
            <div className="w-full">
              <YouTubeSearch onSelectVideo={handleSelectVideo} />
            </div>
        </main>
    </div>
  );
}
