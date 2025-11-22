'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, LogIn, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { RoomParticipantCounter } from '@/components/room-participant-counter';

const PUBLIC_ROOM_ID = "public-study-room-v1";

export default function StudyTogetherPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [roomId, setRoomId] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const createRoom = async () => {
      setIsCreating(true);
      const newId = crypto.randomUUID();
      await supabase.from('rooms').insert({
          id: newId,
          type: 'study',
          owner_id: user.uid,
          notepads: { collaborative: { name: 'Collab', content: '' } },
          timer_state: { mode: 'study', time: 1500, isActive: false }
      });
      router.push(`/study-together/${newId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 flex flex-col items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mb-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-heading">Study Together</CardTitle>
              <CardDescription>Study with others.</CardDescription>
              <RoomParticipantCounter />
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={() => router.push(`/study-together/${PUBLIC_ROOM_ID}`)} className="w-full"><Globe className="mr-2 h-4 w-4" /> Join Public Room</Button>
              <Button onClick={createRoom} className="w-full" variant="outline" disabled={isCreating}><PlusCircle className="mr-2 h-4 w-4" /> Create Private Room</Button>
              <div className="space-y-2">
                    <Label>Room ID</Label>
                    <Input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                    <Button onClick={() => router.push(`/study-together/${roomId}`)} variant="secondary" className="w-full" disabled={!roomId}>Join Room</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}