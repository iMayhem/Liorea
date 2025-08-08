// src/components/room-participant-counter.tsx
'use client';

import * as React from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import { Users, Globe } from 'lucide-react';

const PUBLIC_ROOM_ID = "public-study-room-v1";

export function RoomParticipantCounter() {
    const [publicCount, setPublicCount] = React.useState(0);
    const [privateCount, setPrivateCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, 'studyRooms'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let publicParticipants = 0;
            let privateParticipants = 0;
            snapshot.forEach((doc) => {
                const participants = doc.data().participants || [];
                if (doc.id === PUBLIC_ROOM_ID) {
                    publicParticipants = participants.length;
                } else {
                    privateParticipants += participants.length;
                }
            });
            setPublicCount(publicParticipants);
            setPrivateCount(privateParticipants);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="mt-4 flex justify-center gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
            </div>
        );
    }

    return (
        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Globe className="h-4 w-4 text-primary" />
                <span>Public: <b>{publicCount}</b></span>
            </div>
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" />
                <span>Private: <b>{privateCount}</b></span>
            </div>
        </div>
    )
}
