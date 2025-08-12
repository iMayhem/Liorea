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
import { useDebouncedCallback } from 'use-debounce';
import type { ChatMessage, Participant, UserProfile } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';
import { Label } from '@/components/ui/label';
import { updateUserProfile, getUserProfile } from '@/lib/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { searchYoutube } from '@/ai/flows/youtube-search';
import type { YoutubeSearchOutput } from '@/lib/types/youtube';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JamRoomState {
    currentVideoId: string;
    typingUsers?: { [uid: string]: string };
    participants?: Participant[];
    ownerId?: string;
}

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
    const routeParams = React.use(params as any);
    const { roomId } = routeParams;
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [roomState, setRoomState] = React.useState<JamRoomState | null>(null);
    const playerRef = React.useRef<YouTubePlayer | null>(null);
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

        getDoc(roomRef).then(async (docSnap) => {
            if (!docSnap.exists()) {
                toast({ title: "Error", description: "Jam room not found.", variant: "destructive" });
                router.push('/jamnight');
                return;
            }

            const roomData = docSnap.data();

             if (!roomData.participants?.some((p: Participant) => p.uid === user.uid)) {
                await updateDoc(roomRef, { 
                    participants: arrayUnion({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }) 
                });
            }
            await updateUserProfile(user.uid, { status: { isStudying: false, isJamming: true, roomId: roomId } });
        });

        const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
            const data = doc.data() as JamRoomState;
            setRoomState(data);
        });

        const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        return () => {
            unsubscribeRoom();
            unsubscribeChat();
            if (user && profile) {
                getDoc(roomRef).then(docSnap => {
                    if(docSnap.exists()) {
                        updateDoc(roomRef, { 
                            participants: arrayRemove({ uid: user.uid, username: profile.username, photoURL: profile.photoURL }),
                            [`typingUsers.${user.uid}`]: deleteField()
                        });
                    }
                })
                updateUserProfile(user.uid, { status: { isStudying: false, isJamming: false, roomId: null } });
            }
        };

    }, [roomId, user, profile, authLoading, router, toast]);
    
    const onPlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
    };
    
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
        if (!user || !profile?.username || !roomId) return;
        const roomRef = doc(db, 'jamRooms', roomId);
        const typingField = `typingUsers.${user.uid}`;

        try {
            if (isTyping) {
                await updateDoc(roomRef, { [typingField]: profile.username });
            } else {
                await updateDoc(roomRef, { [typingField]: deleteField() });
            }
        } catch(error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update typing status:", error);
            }
        }
    };
    
    const handleSelectVideo = (videoId: string) => {
        if(videoId && roomState) {
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
      <main className="flex-1 overflow-auto pb-24">
        <div className="container mx-auto h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 flex flex-col h-full">
                  <Card className="w-full h-full flex flex-col overflow-hidden min-h-[250px] md:min-h-[400px] lg:min-h-[500px]">
                    <YouTube
                      videoId={roomState.currentVideoId}
                      onReady={onPlayerReady}
                      opts={{
                        height: '100%',
                        width: '100%',
                        playerVars: {
                          autoplay: 1, // Autoplay for new videos
                          controls: 1,
                        },
                      }}
                      className="w-full h-full flex-grow"
                      key={roomState.currentVideoId} // Force re-render on video change
                    />
                  </Card>
                </div>
                <div className="lg:col-span-1 flex flex-col h-full min-h-[400px] lg:min-h-0">
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
        </div>
      </main>
    </div>
  );
}
