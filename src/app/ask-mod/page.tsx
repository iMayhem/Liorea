'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { Loader2, ShieldQuestion } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/lib/types';
import { GroupChat } from '@/components/group-chat';

const MOD_CHAT_ROOM_ID = 'global-mod-chat';

export default function AskModPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chats')
                .select('*')
                .eq('room_id', MOD_CHAT_ROOM_ID)
                .order('timestamp', { ascending: true });
            
            if (data) setChatMessages(data as any);
            setLoading(false);
        };

        fetchMessages();

        const channel = supabase.channel('mod-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `room_id=eq.${MOD_CHAT_ROOM_ID}` }, (payload: any) => {
                setChatMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };

    }, [user, authLoading, router]);

    const handleSendMessage = async (message: { text: string }, replyTo: { id: string, text: string } | null) => {
        if (!user || !profile?.username || !message.text) return;
        
        await supabase.from('chats').insert({
            room_id: MOD_CHAT_ROOM_ID,
            text: message.text,
            sender_id: user.uid,
            sender_name: profile.username,
            reply_to_id: replyTo?.id,
            reply_to_text: replyTo?.text,
            is_mod: ['Admin', 'Mod', 'Helper'].includes(profile.role || ''),
            timestamp: new Date().toISOString()
        });
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col h-screen">
                <AppHeader />
                <div className="flex-1 flex items-center justify-center bg-transparent">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen">
            <AppHeader />
            <main className="flex-1 flex flex-col container mx-auto p-4 md:p-6 lg:p-8">
                 <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
                    <div className="text-center mb-6 shrink-0">
                        <ShieldQuestion className="mx-auto h-12 w-12 text-primary"/>
                        <h1 className="text-3xl font-bold font-heading mt-2">Ask a Mod</h1>
                        <p className="text-muted-foreground">Have a question? Ask our support team directly.</p>
                    </div>
                     <div className="flex-1 min-h-0">
                        <GroupChat 
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            currentUserId={user!.uid}
                            onTyping={() => {}} 
                            typingUsers={{}}
                        />
                     </div>
                 </div>
            </main>
        </div>
    );
}