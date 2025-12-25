"use client";

import { soundEffects, SoundEffect } from '@/lib/sound-effects';
import { useCallback } from 'react';

export function useSoundEffects() {
    const play = useCallback((sound: SoundEffect, volume?: number) => {
        soundEffects.play(sound, volume);
    }, []);

    const setEnabled = useCallback((enabled: boolean) => {
        soundEffects.setEnabled(enabled);
    }, []);

    const setVolume = useCallback((volume: number) => {
        soundEffects.setVolume(volume);
    }, []);

    const getEnabled = useCallback(() => {
        return soundEffects.getEnabled();
    }, []);

    const getVolume = useCallback(() => {
        return soundEffects.getVolume();
    }, []);

    return {
        play,
        setEnabled,
        setVolume,
        getEnabled,
        getVolume,
    };
}
