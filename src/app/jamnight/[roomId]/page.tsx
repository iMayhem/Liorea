// src/app/jamnight/[roomId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Music, Clipboard, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, collection, addDoc, query, orderBy, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDebouncedCallback } from 'use-debounce';
import type { ChatMessage } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';
import { Label } from '@/components/ui/label';


type PlayerState = 'PLAYING' | 'PAUSED' | 'BUFFERING';

interface JamRoomState {
    currentVideoId: string;
    playerState: PlayerState;
    lastSeekTimestamp: any;
    lastSeekTimeSeconds: number;
    typingUsers?: { [uid: string]: string };
}

export default function JamRoomPage({ params }: { params: { roomId: string } }) {
    const routeParams = React.use(params as any);
    const { roomId } = routeParams;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [roomState, setRoomState] = React.useState<JamRoomState | null>(null);
    const [videoUrl, setVideoUrl] = React.useState('');
    const playerRef = React.useRef<YouTubePlayer | null>(null);
    const isLocalChangeRef = React.useRef(false); // To prevent feedback loops
    const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);


    // Function to parse YouTube video ID from URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Firestore update function
    const updateRoomState = async (newState: Partial<JamRoomState>) => {
        if (!roomId) return;
        isLocalChangeRef.current = true;
        const roomRef = doc(db, 'jamRooms', roomId);
        await updateDoc(roomRef, newState);
        // Allow remote changes to be processed after a short delay
        setTimeout(() => { isLocalChangeRef.current = false; }, 500);
    };
    
    const debouncedSeekUpdate = useDebouncedCallback(async (time: number) => {
        await updateRoomState({ lastSeekTimeSeconds: time, lastSeekTimestamp: serverTimestamp() });
    }, 1000);


    // Effect to handle joining/leaving the room and listening for state changes
    React.useEffect(() => {
        if (authLoading || !user) return;

        const roomRef = doc(db, 'jamRooms', roomId);
        const chatQuery = query(collection(db, 'jamRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));

        // Check if room exists
        getDoc(roomRef).then(async (docSnap) => {
            if (!docSnap.exists()) {
                toast({ title: "Error", description: "Jam room not found.", variant: "destructive" });
                router.push('/jamnight');
                return;
            }
             // Add user to participants list
            await updateDoc(roomRef, { participants: arrayUnion({ uid: user.uid, username: user.username }) });
        });

        const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
            if (isLocalChangeRef.current) return;
            const data = doc.data() as JamRoomState;
            setRoomState(data);
        });

        const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        // Cleanup on unmount
        return () => {
            unsubscribeRoom();
            unsubscribeChat();
            getDoc(roomRef).then(docSnap => {
                if(docSnap.exists()) {
                     updateDoc(roomRef, { 
                         participants: arrayRemove({ uid: user.uid, username: user.username }),
                         [`typingUsers.${user.uid}`]: deleteField()
                     });
                }
            })
        };

    }, [roomId, user, authLoading, router, toast]);

    // Effect to sync local player with room state
    React.useEffect(() => {
        if (!roomState || !playerRef.current) return;

        const player = playerRef.current;
        const currentPlayerState = player.getPlayerState();

        if (roomState.playerState === 'PLAYING' && currentPlayerState !== 1) {
            player.playVideo();
        } else if (roomState.playerState === 'PAUSED' && currentPlayerState !== 2) {
            player.pauseVideo();
        }

        // Sync seek time
        const serverSeekTime = roomState.lastSeekTimeSeconds;
        if(player.getCurrentTime) {
            const localPlayerTime = player.getCurrentTime();
            if (Math.abs(serverSeekTime - localPlayerTime) > 2) { // 2-second tolerance
                player.seekTo(serverSeekTime, true);
            }
        }

    }, [roomState]);


    const handleVideoUrlChange = () => {
        const videoId = getYouTubeId(videoUrl);
        if (videoId) {
            updateRoomState({ currentVideoId: videoId });
        } else {
            toast({ title: "Invalid URL", description: "Please enter a valid YouTube video URL.", variant: "destructive" });
        }
    };
    
    const onPlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
    };
    
    const onPlayerStateChange = (event: { data: number }) => {
        switch (event.data) {
            case 1: // Playing
                updateRoomState({ playerState: 'PLAYING' });
                break;
            case 2: // Paused
                updateRoomState({ playerState: 'PAUSED' });
                break;
        }
    };

    // This gets triggered when the user seeks manually
    const onPlayerSeek = () => {
        if(playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            debouncedSeekUpdate(currentTime);
        }
    }
    
    // Interval to sync seek time periodically, since there's no direct 'onSeek' event
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getPlayerState && playerRef.current.getPlayerState() === 1) { // is playing
                onPlayerSeek();
            }
        }, 5000); // Sync every 5 seconds
        return () => clearInterval(interval);
    }, [onPlayerSeek]);


    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast({
            title: "Room ID Copied!",
            description: "You can now share it with your friends.",
        });
    };
    
     const handleSendMessage = async (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => {
        if (!user || !roomId) return;
        const chatCollectionRef = collection(db, 'jamRooms', roomId, 'chats');
        
        if(!message.text && !message.imageUrl) return;

        const messageData: any = {
          text: message.text,
          imageUrl: message.imageUrl || null,
          senderId: user.uid,
          senderName: user.username,
          timestamp: serverTimestamp(),
        };

        if (replyTo) {
          messageData.replyToId = replyTo.id;
          messageData.replyToText = replyTo.text;
        }
        
        await addDoc(chatCollectionRef, messageData);
    };

    const handleTyping = async (isTyping: boolean) => {
        if (!user || !user.username || !roomId) return;
        const roomRef = doc(db, 'jamRooms', roomId);
        const typingField = `typingUsers.${user.uid}`;

        try {
            if (isTyping) {
                await updateDoc(roomRef, { [typingField]: user.username });
            } else {
                await updateDoc(roomRef, { [typingField]: deleteField() });
            }
        } catch(error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update typing status:", error);
            }
        }
    };


    if (authLoading || !roomState || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <AppHeader />
             <header className="border-b shrink-0">
                <div className="container mx-auto py-3 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Music className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-heading">Jamnight</h1>
                    </div>
                    <Button variant="outline" onClick={handleCopyRoomId}>
                        <Clipboard className="mr-2 h-4 w-4"/>
                        Copy Room ID
                    </Button>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="grid lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card className="overflow-hidden">
                             <div className="aspect-video">
                                 <YouTube
                                    videoId={roomState.currentVideoId}
                                    onReady={onPlayerReady}
                                    onStateChange={onPlayerStateChange}
                                    opts={{
                                        height: '100%',
                                        width: '100%',
                                        playerVars: {
                                            autoplay: 0,
                                            controls: 1,
                                        },
                                    }}
                                    className="w-full h-full"
                                 />
                             </div>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="youtube-url">YouTube URL</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="youtube-url"
                                            placeholder="Paste a YouTube URL"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                        />
                                        <Button onClick={handleVideoUrlChange}>Set</Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Current Video ID: {roomState.currentVideoId}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 h-full flex flex-col min-h-[400px] lg:min-h-0">
                         <GroupChat 
                            messages={chatMessages} 
                            onSendMessage={handleSendMessage} 
                            currentUserId={user!.uid} 
                            onTyping={handleTyping}
                            typingUsers={roomState.typingUsers || {}}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
    
