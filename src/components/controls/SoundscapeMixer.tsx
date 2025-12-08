
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
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: false }), {})
  );
  const isInitializing = useRef(false);

  useEffect(() => {
    // Ensure this runs only once.
    if (!isInitializing.current) {
      isInitializing.current = true;
      // We only need to start the audio context, not create all players upfront.
      Tone.start();
    }

    return () => {
      // Cleanup players on component unmount
      players.current.forEach(player => player.dispose());
      players.current.clear();
    };
  }, []);

  const toggleSound = (sound: Sound) => {
    const wasActive = activeSounds[sound.id];
    
    // If turning the sound OFF
    if (wasActive) {
      const player = players.current.get(sound.id);
      if (player) {
        player.volume.rampTo(-Infinity, 0.5);
      }
      setActiveSounds(prev => ({...prev, [sound.id]: false}));
      return;
    }

    // If turning the sound ON
    setActiveSounds(prev => ({...prev, [sound.id]: true}));
    
    // If player already exists, just fade it in.
    const existingPlayer = players.current.get(sound.id);
    if (existingPlayer) {
      existingPlayer.volume.rampTo(-15, 0.1);
      return;
    }

    // If player doesn't exist, create it and have it autostart.
    // This is the key fix: `autostart: true` waits for the buffer to load
    // before playing, preventing the error.
    const player = new Tone.Player({
      url: sound.file,
      loop: true,
      autostart: true,
      volume: -15,
      fadeIn: 0.5,
      fadeOut: 0.5,
    }).toDestination();
    
    players.current.set(sound.id, player);
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
            onClick={() => toggleSound(sound)}
            data-state={activeSounds[sound.id] ? 'active' : 'inactive'}
        >
                <Icon className="w-6 h-6" />
        </Button>
        );
    })}
    </div>
  );
}
