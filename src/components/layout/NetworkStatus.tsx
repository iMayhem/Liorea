"use client";

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 1. Check initial status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // 2. Listen for changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
      <div className="relative mb-6">
        {/* Animated Rings */}
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
        <div className="absolute inset-0 bg-red-500/40 rounded-full animate-pulse delay-75"></div>
        
        <div className="relative bg-[#1e1e24] p-6 rounded-full border border-red-500/50 shadow-2xl">
            <WifiOff className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Connection Lost</h2>
      <p className="text-white/50 text-center max-w-xs mb-8">
        It seems you are offline. We are trying to reconnect...
      </p>

      {/* Fake Loading Bar */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 w-1/3 animate-[shimmer_1.5s_infinite_linear]" 
             style={{ 
               backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
               backgroundSize: '200% 100%'
             }}
        />
      </div>
    </div>
  );
}