// src/components/persistent-ambient-sound.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';

export function PersistentAmbientSound() {
    const { activeSound, volume, isMuted, isBeastModeLocked } = useStudyRoom();

    const audioRefs = {
        rain: React.useRef<HTMLAudioElement>(null),
        fire: React.useRef<HTMLAudioElement>(null),
        coffee: React.useRef<HTMLAudioElement>(null),
        ocean: React.useRef<HTMLAudioElement>(null),
    };

    // This effect handles playing and stopping audio based on the activeSound
    React.useEffect(() => {
        const playAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
            if (audioRef.current) {
                audioRef.current.loop = true;
                // Only set src when needed to prevent preloading
                if (!audioRef.current.src) {
                    const soundUrl = audioRef.current.getAttribute('data-src');
                    if (soundUrl) {
                        audioRef.current.src = soundUrl;
                    }
                }
                audioRef.current.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.error("Audio play failed:", e)
                    }
                });
            }
        };

        const stopAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }
        };

        // Stop all sounds first
        Object.values(audioRefs).forEach(stopAudio);

        // Then play the active one, if not 'none' and not in beast mode
        if (activeSound !== 'none' && !isBeastModeLocked) {
            const activeAudioRef = audioRefs[activeSound];
            if (activeAudioRef) {
                playAudio(activeAudioRef);
            }
        }
  }, [activeSound, isBeastModeLocked]);

  // This effect handles volume changes
  React.useEffect(() => {
    const finalVolume = isMuted || isBeastModeLocked ? 0 : volume;
    Object.values(audioRefs).forEach(ref => {
        if (ref.current) {
            ref.current.volume = finalVolume;
        }
    });
  }, [volume, isMuted, isBeastModeLocked]);

  return (
    <>
      {/* Audio elements are kept here but hidden, and src is deferred */}
      <audio ref={audioRefs.rain} data-src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Frain.mp3?alt=media&token=580e8761-eff6-428d-8e96-bfed804625d5"></audio>
      <audio ref={audioRefs.fire} data-src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Ffire.mp3?alt=media&token=5ce9d307-e724-429a-9be8-304b76de7455"></audio>
      <audio ref={audioRefs.coffee} data-src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2FCoffee%20Shop%20Ambience%20_%20Cafe%20Background%20Noise%20for%20Study%2C%20Focus%20_%20White%20Noise%2C%20%EC%B9%B4%ED%8E%98%20asmr%2C%20%EB%B0%B1%EC%83%89%EC%86%8C%EC%9D%8C.mp3?alt=media&token=113642db-60fb-4abc-84dc-a48e49fead9d"></audio>
      <audio ref={audioRefs.ocean} data-src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2FSoftest%20Beach%20Sounds%20from%20the%20Tropics%20-%20Ocean%20Wave%20Sounds%20for%20Sleeping%2C%20Yoga%2C%20Meditation%2C%20Study.mp3?alt=media&token=f5e4f247-b15c-4861-8063-ab506a90b188"></audio>
    </>
  );
}
