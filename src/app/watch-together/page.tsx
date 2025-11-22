'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

const PUBLIC_WATCH_ROOM_ID = "public-watch-room-v1";

export default function WatchTogetherPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isJoining, setIsJoining] = React.useState(false);
  
  React.useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const joinPublic = async () => {
      setIsJoining(true);
      const { data } = await supabase.from('rooms').select('id').eq('id', PUBLIC_WATCH_ROOM_ID).single();
      if(!data) {
           await supabase.from('rooms').insert({
                id: PUBLIC_WATCH_ROOM_ID,
                type: 'watch',
                owner_id: user.uid,
                current_video_id: 'jfKfPfyJRdk',
                participants: []
           });
      }
      router.push(`/watch-together/${PUBLIC_WATCH_ROOM_ID}`);
  }

  if (authLoading || !user) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-heading">Watchparty</CardTitle>
              <CardDescription>Watch videos with friends.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={joinPublic} className="w-full" disabled={isJoining}>
                {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />} Join Public Room
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}