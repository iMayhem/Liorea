
"use client";
import { useState, useEffect, useRef } from 'react';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';

interface SoundscapeMixerProps {
  sounds: Sound[];
}

export default function SoundscapeMixer({ sounds }: SoundscapeMixerProps) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: false }), {})
  );
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: 0.5 }), {})
  );

  useEffect(() => {
    sounds.forEach(sound => {
        if (!audioRefs.current.has(sound.id)) {
            const audio = new Audio(sound.file);
            audio.loop = true;
            audioRefs.current.set(sound.id, audio);
        }
    });

    return () => {
        audioRefs.current.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        audioRefs.current.clear();
    };
  }, [sounds]);

  const fade = (audio: HTMLAudioElement, to: 'in' | 'out', volume: number) => {
    const targetVolume = to === 'in' ? volume : 0;
    const initialVolume = to === 'in' ? 0 : audio.volume;
    const duration = 500;
    const intervalTime = 50;
    const step = (targetVolume - initialVolume) / (duration / intervalTime);

    if (to === 'in' && audio.paused) {
      audio.volume = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
    
    const fadeInterval = setInterval(() => {
        const newVolume = audio.volume + step;
        if ((step > 0 && newVolume >= targetVolume) || (step < 0 && newVolume <= targetVolume)) {
            audio.volume = targetVolume;
            if (to === 'out') {
                audio.pause();
            }
            clearInterval(fadeInterval);
        } else {
            audio.volume = newVolume;
        }
    }, intervalTime);
  };


  const toggleSound = (sound: Sound) => {
    const audio = audioRefs.current.get(sound.id);
    if (!audio) return;

    const wasActive = activeSounds[sound.id];
    const newActiveState = !wasActive;
    
    setActiveSounds(prev => ({ ...prev, [sound.id]: newActiveState }));

    if (newActiveState) {
      fade(audio, 'in', volumes[sound.id]);
    } else {
      fade(audio, 'out', volumes[sound.id]);
    }
  };

  const handleVolumeChange = (soundId: string, newVolume: number) => {
    setVolumes(prev => ({ ...prev, [soundId]: newVolume }));
    const audio = audioRefs.current.get(soundId);
    if (audio && !audio.paused) {
        audio.volume = newVolume;
    }
  }
  
  return (
    <div className="flex items-center gap-2">
    {sounds.map(sound => {
        const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
        const isActive = activeSounds[sound.id];
        return (
            <Popover key={sound.id}>
                <PopoverTrigger asChild>
                    <Button 
                        variant="ghost"
                        size="icon" 
                        className="text-white/70 hover:bg-white/10 hover:text-white rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white"
                        data-state={isActive ? 'active' : 'inactive'}
                        onClick={() => toggleSound(sound)}
                    >
                            <Icon className="w-6 h-6" />
                    </Button>
                </PopoverTrigger>
                {isActive && (
                    <PopoverContent className="w-40" side="top" align="center">
                        <Slider
                            defaultValue={[volumes[sound.id]]}
                            max={1}
                            step={0.05}
                            onValueChange={([value]) => handleVolumeChange(sound.id, value)}
                        />
                    </PopoverContent>
                )}
            </Popover>
        );
    })}
    </div>
  );
}
