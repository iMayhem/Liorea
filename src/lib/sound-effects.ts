// Sound effect URLs (using free CDN-hosted sounds)
export const UI_SOUNDS = {
    // Chat & Messaging
    messageSend: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    messageReceive: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Soft pop for standard messages
    reaction: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',

    // UI Interactions
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    toggle: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',

    // Notifications
    notification: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/notifchat.mp3', // Distinct notification sound (mentions/system)
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',

    // Study
    timerStart: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    timerComplete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    focusToggle: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
} as const;

export type SoundEffect = keyof typeof UI_SOUNDS;

class SoundEffectManager {
    private audioCache: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;
    private volume: number = 0.3;

    constructor() {
        // Load preferences from localStorage (only on client side)
        if (typeof window !== 'undefined') {
            const savedEnabled = localStorage.getItem('sound-effects-enabled');
            const savedVolume = localStorage.getItem('sound-effects-volume');

            this.enabled = savedEnabled !== 'false';
            this.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
        }
    }

    private getAudio(url: string): HTMLAudioElement {
        if (!this.audioCache.has(url)) {
            const audio = new Audio(url);
            audio.volume = this.volume;
            this.audioCache.set(url, audio);
        }
        return this.audioCache.get(url)!;
    }

    play(sound: SoundEffect, customVolume?: number) {
        if (!this.enabled || typeof window === 'undefined') return;

        try {
            const url = UI_SOUNDS[sound];
            const audio = this.getAudio(url);
            audio.volume = customVolume ?? this.volume;

            // Clone and play to allow overlapping sounds
            const clone = audio.cloneNode() as HTMLAudioElement;
            clone.volume = audio.volume;
            clone.play().catch(err => console.warn('Sound play failed:', err));
        } catch (err) {
            console.warn('Failed to play sound:', err);
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('sound-effects-enabled', String(enabled));
        }
    }

    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (typeof window !== 'undefined') {
            localStorage.setItem('sound-effects-volume', String(this.volume));
        }

        // Update all cached audio volumes
        this.audioCache.forEach(audio => {
            audio.volume = this.volume;
        });
    }

    getEnabled(): boolean {
        return this.enabled;
    }

    getVolume(): number {
        return this.volume;
    }
}

export const soundEffects = new SoundEffectManager();
