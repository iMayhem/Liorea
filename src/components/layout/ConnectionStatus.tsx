"use client";

import React from 'react';
import { useFirebaseConnection } from '@/hooks/use-firebase-connection';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Visual indicator for Firebase connection status
 * Shows when offline or reconnecting
 */
export default function ConnectionStatus() {
    const { isConnected, isConnecting } = useFirebaseConnection();
    const [showOffline, setShowOffline] = React.useState(false);

    React.useEffect(() => {
        // Only show offline indicator after being disconnected for 2 seconds
        // This prevents flashing during brief network hiccups
        if (!isConnected && !isConnecting) {
            const timer = setTimeout(() => setShowOffline(true), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowOffline(false);
        }
    }, [isConnected, isConnecting]);

    return (
        <AnimatePresence>
            {showOffline && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-red-900/90 backdrop-blur-sm border border-red-700/50 rounded-lg px-4 py-2 shadow-lg">
                        <div className="flex items-center gap-2 text-red-100">
                            <WifiOff className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {isConnecting ? 'Reconnecting...' : 'You are offline'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
