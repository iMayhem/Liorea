"use client";

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to prevent the browser from closing the website or sleeping due to inactivity.
 * Uses Screen Wake Lock API and a silent audio loop.
 */
export function useKeepAlive() {
    const wakeLockRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    // 1. Silent Audio Loop
    // This helps keep the tab's process priority high and prevents it from being "discarded"
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Data URI for 1 second of silence
        const SILENT_SOUND = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

        const audio = new Audio(SILENT_SOUND);
        audio.loop = true;
        audio.volume = 0.01; // Extremely low volume
        audioRef.current = audio;

        const startAudio = () => {
            audio.play().catch(() => {
                // Autoplay might be blocked until interaction
                console.log("Keep-alive: Waiting for user interaction to start silent audio");
            });
            window.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', startAudio);
        };

        window.addEventListener('click', startAudio);
        window.addEventListener('keydown', startAudio);

        return () => {
            audio.pause();
            window.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', startAudio);
        };
    }, []);

    // 2. Screen Wake Lock
    useEffect(() => {
        if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
            console.warn('Keep-alive: Screen Wake Lock API not supported');
            setIsSupported(false);
            return;
        }

        const requestWakeLock = async () => {
            try {
                // @ts-ignore - wakeLock is relatively new in TS types
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Keep-alive: Wake Lock acquired');

                wakeLockRef.current.addEventListener('release', () => {
                    console.log('Keep-alive: Wake Lock released');
                });
            } catch (err: any) {
                console.error(`Keep-alive: Wake Lock error: ${err.name}, ${err.message}`);
            }
        };

        // Re-acquire wake lock if tab becomes visible
        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        requestWakeLock();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return { isSupported };
}
