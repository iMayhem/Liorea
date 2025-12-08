"use client";
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Slider } from '@/components/ui/slider';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Card } from '../ui/card';

interface SoundscapeMixerProps {
  sounds: Sound[];
}

export default function SoundscapeMixer({ sounds }: SoundscapeMixerProps) {
  const players = useRef<Map<string, Tone.Player>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: 0 }), {})
  );

  useEffect(() => {
    if (isInitialized) {
        sounds.forEach(sound => {
          if (!players.current.has(sound.id)) {
            const player = new Tone.Player({
              url: sound.file,
              loop: true,
              autostart: volumes[sound.id] > 0,
              volume: volumes[sound.id] > 0 ? (volumes[sound.id] / 100) * 40 - 40 : -Infinity,
            }).toDestination();
            players.current.set(sound.id, player);
          }
        });
    }

    return () => {
      if (isInitialized) {
        players.current.forEach(player => player.dispose());
        players.current.clear();
      }
    };
  }, [sounds, isInitialized, volumes]);

  const handleVolumeChange = (id: string, value: number) => {
    const newVolumes = { ...volumes, [id]: value };
    setVolumes(newVolumes);
    const player = players.current.get(id);
    if (player) {
      if (value === 0) {
        player.volume.value = -Infinity;
      } else {
        const db = (value / 100) * 40 - 40;
        player.volume.value = db;
        if(player.state !== 'started') player.start();
      }
    }
  };
  
  const startAudio = async () => {
    if(!isInitialized) {
      await Tone.start();
      setIsInitialized(true);
      console.log("Audio context started");
    }
  };

  return (
    <div className="p-4" onClick={startAudio}>
        {!isInitialized && <p className='text-center text-muted-foreground'>Click here to enable audio</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sounds.map(sound => {
            const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
            return (
            <Card key={sound.id} className="flex flex-col items-center gap-2 p-4">
                <Icon className="w-8 h-8 text-primary" />
                <span className="font-medium">{sound.name}</span>
                <Slider
                disabled={!isInitialized}
                value={[volumes[sound.id]]}
                onValueChange={([val]) => handleVolumeChange(sound.id, val)}
                max={100}
                step={1}
                className="w-full"
                />
            </Card>
            );
        })}
        </div>
    </div>
  );
}
