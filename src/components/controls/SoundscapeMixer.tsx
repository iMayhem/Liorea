
"use client";
import { useState, useEffect, useRef } from 'react';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';

interface SoundscapeMixerProps {
  sounds: Sound[];
}

export default function SoundscapeMixer({ sounds }: SoundscapeMixerProps) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>(() =>
    sounds.reduce((acc, sound) => ({ ...acc, [sound.id]: false }), {})
  );

  useEffect(() => {
    // This effect ensures audio elements are created on the client
    sounds.forEach(sound => {
        if (!audioRefs.current.has(sound.id)) {
            const audio = new Audio(sound.file);
            audio.loop = true;
            audioRefs.current.set(sound.id, audio);
        }
    });

    return () => {
        // Cleanup audio elements to prevent memory leaks
        audioRefs.current.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        audioRefs.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fade = (audio: HTMLAudioElement, to: 'in' | 'out') => {
    const targetVolume = to === 'in' ? 0.5 : 0;
    const initialVolume = audio.volume;
    const duration = 500; // 0.5 seconds
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

    if (wasActive) {
      fade(audio, 'out');
    } else {
      fade(audio, 'in');
    }

    setActiveSounds(prev => ({ ...prev, [sound.id]: !wasActive }));
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
