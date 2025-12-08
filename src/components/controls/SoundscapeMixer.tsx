
"use client";
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';

interface SoundscapeMixerProps {
  sounds: Sound[];
}

export default function SoundscapeMixer({ sounds }: SoundscapeMixerProps) {
  const players = useRef<Map<string, Tone.Player>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: false }), {})
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
    };

    if (typeof window !== 'undefined') {
        createPlayers();
    }

    return () => {
      players.current.forEach(player => player.dispose());
      players.current.clear();
    };
  }, [sounds]);

  const toggleSound = (id: string) => {
    if (!isInitialized) return;

    const player = players.current.get(id);
    if (!player) return;

    const wasActive = activeSounds[id];
    
    if (wasActive) {
        player.volume.rampTo(-Infinity, 0.5);
    } else {
        const db = -15; // Set a default comfortable volume
        player.volume.rampTo(db, 0.1);
        if (player.state !== 'started') {
            player.start();
        }
    }
    setActiveSounds(prev => ({...prev, [id]: !wasActive}));
  };
  
  return (
    <div className="flex items-center gap-2">
    {sounds.map(sound => {
        const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
        return (
        <Button 
            key={sound.id}
            variant="ghost"
            size="icon" 
            className="text-white/70 hover:bg-white/10 hover:text-white rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white"
            onClick={() => toggleSound(sound.id)}
            data-state={activeSounds[sound.id] ? 'active' : 'inactive'}
        >
                <Icon className="w-6 h-6" />
        </Button>
        );
    })}
    </div>
  );
}
