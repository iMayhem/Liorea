// src/components/ambient-sound-player.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Music, Volume2, CloudRain, Flame } from 'lucide-react';
import type { SoundType } from '@/lib/types';

interface AmbientSoundPlayerProps {
  activeSound: SoundType;
  onSoundChange: (sound: SoundType) => void;
}

export function AmbientSoundPlayer({ activeSound, onSoundChange }: AmbientSoundPlayerProps) {
  const [volume, setVolume] = React.useState(0.5);
  const rainAudioRef = React.useRef<HTMLAudioElement>(null);
  const fireAudioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    const playAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    };

    const stopAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
      if (audioRef.current) {
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

  React.useEffect(() => {
    if(rainAudioRef.current) rainAudioRef.current.volume = volume;
    if(fireAudioRef.current) fireAudioRef.current.volume = volume;
  }, [volume]);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Music className="h-5 w-5" />
          Ambient Sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <Button
                variant={activeSound === 'rain' ? 'secondary' : 'outline'}
                onClick={() => onSoundChange(activeSound === 'rain' ? 'none' : 'rain')}
                className="flex-1"
            >
                <CloudRain className="mr-2 h-4 w-4" />
                Rain
            </Button>
            <Button
                variant={activeSound === 'fire' ? 'secondary' : 'outline'}
                onClick={() => onSoundChange(activeSound === 'fire' ? 'none' : 'fire')}
                className="flex-1"
            >
                <Flame className="mr-2 h-4 w-4" />
                Fire
            </Button>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <Slider
            value={[volume * 100]}
            onValueChange={(value) => setVolume(value[0] / 100)}
            max={100}
            step={1}
          />
        </div>
      </CardContent>
      {/* Audio elements are kept here but hidden */}
      <audio ref={rainAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Frain.mp3?alt=media&token=580e8761-eff6-428d-8e96-bfed804625d5" preload="auto"></audio>
      <audio ref={fireAudioRef} src="https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/sounds%2Ffire.mp3?alt=media&token=5ce9d307-e724-429a-9be8-304b76de7455" preload="auto"></audio>
    </Card>
  );
}
