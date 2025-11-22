'use client';
import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from './ui/skeleton';
import { Users, Globe } from 'lucide-react';

export function RoomParticipantCounter() {
    const [publicCount, setPublicCount] = React.useState(0);
    const [privateCount, setPrivateCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCounts = async () => {
            const { data } = await supabase.from('rooms').select('participants, id');
            if(data) {
                let pub = 0, priv = 0;
                data.forEach((r: any) => {
                    const count = (r.participants || []).length;
                    if(r.id.includes('public')) pub += count;
                    else priv += count;
                });
                setPublicCount(pub);
                setPrivateCount(priv);
            }
            setLoading(false);
        };
        fetchCounts();
    }, []);

    if (loading) return <Skeleton className="h-6 w-24 mx-auto" />;

    return (
        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Globe className="h-4 w-4 text-primary" /> <span>Public: <b>{publicCount}</b></span></div>
            <div className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> <span>Private: <b>{privateCount}</b></span></div>
        </div>
    )
}