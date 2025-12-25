import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onDisconnect, onValue } from 'firebase/database';

interface ConnectionStatus {
    isConnected: boolean;
    isConnecting: boolean;
    lastConnected: number | null;
}

/**
 * Monitor Firebase Realtime Database connection status
 */
export function useFirebaseConnection() {
    const [status, setStatus] = useState<ConnectionStatus>({
        isConnected: false,
        isConnecting: true,
        lastConnected: null,
    });

    useEffect(() => {
        // Monitor connection state using .info/connected
        const connectedRef = ref(db, '.info/connected');

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            const isConnected = snapshot.val() === true;

            setStatus(prev => ({
                isConnected,
                isConnecting: false,
                lastConnected: isConnected ? Date.now() : prev.lastConnected,
            }));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return status;
}
