// src/components/persistent-ambient-sound.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';

export function PersistentAmbientSound() {
    const { roomData, volume, isMuted, isBeastModeLocked } = useStudyRoom();
    const activeSound = roomData?.activeSound;

    const rainAudioRef = React.useRef<HTMLAudioElement>(null);
    const fireAudioRef = React.useRef<HTMLAudioElement>(null);
    const coffeeAudioRef = React.useRef<HTMLAudioElement>(null);
    const oceanAudioRef = React.useRef<HTMLAudioElement>(null);
    
    // This effect handles playing and stopping audio based on the room's activeSound
    React.useEffect(() => {
        const playAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => {
                // Ignore errors from being interrupted by a pause call.
                if (e.name !== 'AbortError') {
                console.error("Audio play failed:", e)
                }
            });
        }
        };

        const stopAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        };
        
        // Stop all sounds if beast mode is locked
        if(isBeastModeLocked) {
            stopAudio(rainAudioRef);
            stopAudio(fireAudioRef);
            stopAudio(coffeeAudioRef);
            stopAudio(oceanAudioRef);
            return;
        }

        stopAudio(rainAudioRef);
        stopAudio(fireAudioRef);
        stopAudio(coffeeAudioRef);
        stopAudio(oceanAudioRef);

        if (activeSound === 'rain') {
            playAudio(rainAudioRef);
        } else if (activeSound === 'fire') {
            playAudio(fireAudioRef);
        } else if (activeSound === 'coffee') {
            playAudio(coffeeAudioRef);
        } else if (activeSound === 'ocean') {
            playAudio(oceanAudioRef);
        }
  }, [activeSound, isBeastModeLocked]);

  // This effect handles volume changes
  React.useEffect(() => {
    const finalVolume = isMuted || isBeastModeLocked ? 0 : volume;
    if(rainAudioRef.current) rainAudioRef.current.volume = finalVolume;
    if(fireAudioRef.current) fireAudioRef.current.volume = finalVolume;
    if(coffeeAudioRef.current) coffeeAudioRef.current.volume = finalVolume;
    if(oceanAudioRef.current) oceanAudioRef.current.volume = finalVolume;
  }, [volume, isMuted, isBeastModeLocked]);

  return (
    <>
      {/* Audio elements are kept here but hidden */}
      <audio ref={rainAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Frain.mp3?alt=media&token=580e8761-eff6-428d-8e96-bfed804625d5" preload="auto"></audio>
      <audio ref={fireAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Ffire.mp3?alt=media&token=5ce9d307-e724-429a-9be8-304b76de7455" preload="auto"></audio>
      <audio ref={coffeeAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2FCoffee%20Shop%20Ambience%20_%20Cafe%20Background%20Noise%20for%20Study%2C%20Focus%20_%20White%20Noise%2C%20%EC%B9%B4%ED%8E%98%20asmr%2C%20%EB%B0%B1%EC%83%89%EC%86%8C%EC%9D%8C.mp3?alt=media&token=113642db-60fb-4abc-84dc-a48e49fead9d" preload="auto"></audio>
      <audio ref={oceanAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2FSoftest%20Beach%20Sounds%20from%20the%20Tropics%20-%20Ocean%20Wave%20Sounds%20for%20Sleeping%2C%20Yoga%2C%20Meditation%2C%20Study.mp3?alt=media&token=f5e4f247-b15c-4861-8063-ab506a90b188" preload="auto"></audio>
    </>
  );
}
