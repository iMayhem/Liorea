// src/components/persistent-ambient-sound.tsx
'use client';

import * as React from 'react';
import { useStudyRoom } from '@/hooks/use-study-room';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';

export function PersistentAmbientSound() {
    const { roomData } = useStudyRoom();
    const activeSound = roomData?.activeSound;

    const [volume, setVolume] = React.useState(0.5);
    const [isMuted, setIsMuted] = React.useState(false);
    const rainAudioRef = React.useRef<HTMLAudioElement>(null);
    const fireAudioRef = React.useRef<HTMLAudioElement>(null);
    
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

        stopAudio(rainAudioRef);
        stopAudio(fireAudioRef);

        if (activeSound === 'rain') {
            playAudio(rainAudioRef);
        } else if (activeSound === 'fire') {
            playAudio(fireAudioRef);
        }
  }, [activeSound]);

  // This effect handles volume changes
  React.useEffect(() => {
    const finalVolume = isMuted ? 0 : volume;
    if(rainAudioRef.current) rainAudioRef.current.volume = finalVolume;
    if(fireAudioRef.current) fireAudioRef.current.volume = finalVolume;
  }, [volume, isMuted]);

  if (!activeSound || activeSound === 'none') {
    return null;
  }
  
  return (
    <>
      <div className="fixed bottom-24 right-4 z-50 bg-card p-2 rounded-lg border shadow-lg flex items-center gap-2">
         <button onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={(value) => {
                setIsMuted(false);
                setVolume(value[0] / 100)
            }}
            max={100}
            step={1}
            className="w-24"
          />
      </div>
      {/* Audio elements are kept here but hidden */}
      <audio ref={rainAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Frain.mp3?alt=media&token=580e8761-eff6-428d-8e96-bfed804625d5" preload="auto"></audio>
      <audio ref={fireAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Ffire.mp3?alt=media&token=5ce9d307-e724-429a-9be8-304b76de7455" preload="auto"></audio>
    </>
  );
}

