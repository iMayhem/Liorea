'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import YouTube from 'react-youtube';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

// Mock search for now as requested to ensure functionality without external API deps
const mockSearchYoutube = async (query: string) => {
    return { videos: [
        { videoId: 'jfKfPfyJRdk', title: 'Lofi Girl - Beats to Relax/Study to', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
        { videoId: '5qap5aO4i9A', title: 'Lofi Girl - Beats to Sleep/Chill to', thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' }
    ] };
};

function YouTubeSearch({ onSelectVideo }: { onSelectVideo: (videoId: string) => void }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const handleSearch = async () => {
        const res = await mockSearchYoutube(searchQuery);
        setSearchResults(res.videos);
    };
    return (
        <Card>
            <CardHeader><CardTitle>Find Video</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
                    <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
                </div>
                 {searchResults.length > 0 && (
                    <ScrollArea className="h-72">
                        <div className="space-y-2">
                            {searchResults.map(video => (
                                <div key={video.videoId} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-accent rounded" onClick={() => onSelectVideo(video.videoId)}>
                                    <Image src={video.thumbnail} alt={video.title} width={80} height={60} className="rounded" />
                                    <p className="text-sm">{video.title}</p>
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

    const [currentVideoId, setCurrentVideoId] = React.useState<string>('jfKfPfyJRdk');
    const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);

    React.useEffect(() => {
        if (authLoading || !user) return;

        const fetchData = async () => {
            const { data } = await supabase.from('rooms').select('*').eq('id', roomId).single();
            if (data) {
                if (data.current_video_id) setCurrentVideoId(data.current_video_id);
                
                // Join logic
                const currentParticipants = data.participants || [];
                if (!currentParticipants.find((p: any) => p.uid === user.uid)) {
                    const newParticipants = [...currentParticipants, { 
                        uid: user.uid, 
                        username: profile?.username, 
                        photoURL: profile?.photoURL 
                    }];
                    await supabase.from('rooms').update({ participants: newParticipants }).eq('id', roomId);
                }
            } else {
                // Create if missing (fallback)
                await supabase.from('rooms').insert({
                    id: roomId,
                    owner_id: user.uid,
                    participants: [{ uid: user.uid, username: profile?.username, photoURL: profile?.photoURL }],
                    current_video_id: 'jfKfPfyJRdk'
                });
            }
            
            const { data: chats } = await supabase.from('chats').select('*').eq('room_id', roomId).order('timestamp', { ascending: true });
            if (chats) setChatMessages(chats as any);
        };
        fetchData();

        const channel = supabase.channel(`jam:${roomId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload: any) => {
                if (payload.new.current_video_id) setCurrentVideoId(payload.new.current_video_id);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `room_id=eq.${roomId}` }, (payload: any) => {
                setChatMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, user, authLoading, profile]);

    const handleSendMessage = async (message: {text: string}, replyTo: any) => {
        if (!user || !roomId) return;
        await supabase.from('chats').insert({
            room_id: roomId,
            sender_id: user.uid,
            sender_name: profile?.username,
            text: message.text,
            timestamp: new Date().toISOString()
        });
    };

    const handleSelectVideo = async (videoId: string) => {
        await supabase.from('rooms').update({ current_video_id: videoId }).eq('id', roomId);
    }

    if (authLoading || !user) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="flex flex-col h-screen">
            <AppHeader />
            <main className="flex-1 container mx-auto p-4 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
                    <div className="lg:col-span-2 h-full">
                        <Card className="w-full h-full overflow-hidden bg-black">
                             <YouTube 
                                videoId={currentVideoId} 
                                opts={{ height: '100%', width: '100%', playerVars: { autoplay: 1 } }} 
                                className="w-full h-full" 
                                iframeClassName="w-full h-full"
                             />
                        </Card>
                    </div>
                    <div className="lg:col-span-1 h-full">
                         <GroupChat 
                            messages={chatMessages} 
                            onSendMessage={handleSendMessage} 
                            currentUserId={user.uid} 
                            onTyping={() => {}} 
                            typingUsers={{}} 
                        />
                    </div>
                </div>
                <div className="max-w-xl">
                    <YouTubeSearch onSelectVideo={handleSelectVideo} />
                </div>
            </main>
        </div>
    );
}