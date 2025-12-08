
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
    const createPlayers = async () => {
        await Tone.start();
        sounds.forEach(sound => {
          if (!players.current.has(sound.id)) {
            const player = new Tone.Player({
              url: sound.file,
              loop: true,
              volume: -Infinity,
              fadeIn: 0.5,
              fadeOut: 0.5,
            }).toDestination();
            players.current.set(sound.id, player);
          }
        });
        setIsInitialized(true);
        console.log("Audio context and players initialized.");
    };

    createPlayers();

    return () => {
      players.current.forEach(player => player.dispose());
      players.current.clear();
      console.log("Players disposed.");
    };
  }, [sounds]);

  const handleVolumeChange = (id: string, value: number) => {
    if (!isInitialized) return;

    setVolumes(prev => ({ ...prev, [id]: value }));
    const player = players.current.get(id);

    if (player) {
      if (value > 0) {
        const db = (value / 100) * 40 - 40; // Convert 0-100 to -40dB to 0dB range
        player.volume.rampTo(db, 0.1);
        if (player.state !== 'started') {
          player.start();
        }
      } else {
        player.volume.rampTo(-Infinity, 0.5);
      }
    }
  };
  
  return (
    <div className="p-4 w-96">
        {!isInitialized && <p className='text-center text-muted-foreground'>Initializing audio...</p>}
        <div className="grid grid-cols-4 gap-4">
        {sounds.map(sound => {
            const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
            return (
            <div key={sound.id} className="flex flex-col items-center gap-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-16 h-16 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => handleVolumeChange(sound.id, volumes[sound.id] > 0 ? 0 : 50)}
                >
                     <Icon className="w-8 h-8" />
                </Button>
                <span className="text-xs text-white/80">{sound.name}</span>
            </div>
            );
        })}
        </div>
    </div>
  );
}
