
"use client";
import { useState, useEffect, useRef } from 'react';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Volume2 } from 'lucide-react';
import { useFocus } from '@/context/FocusContext';

interface SoundscapeMixerProps {
  sounds: Sound[];
}

export default function SoundscapeMixer({ sounds }: SoundscapeMixerProps) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const { toggleFocusMode, isFocusMode } = useFocus();

  useEffect(() => {
    sounds.forEach(sound => {
      if (sound.file && !audioRefs.current.has(sound.id)) {
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
    const initialVolume = audio.volume;
    const duration = 500; 
    const intervalTime = 50;
    if (duration <= 0) {
      audio.volume = targetVolume;
      if (to === 'out') audio.pause();
      return;
    }
    const step = (targetVolume - initialVolume) / (duration / intervalTime);

    if (to === 'in' && audio.paused) {
      audio.volume = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
    
    let currentInterval: NodeJS.Timeout | null = null;
    currentInterval = setInterval(() => {
        const newVolume = audio.volume + step;
        if ((step > 0 && newVolume >= targetVolume) || (step < 0 && newVolume <= targetVolume)) {
            audio.volume = targetVolume;
            if (to === 'out') {
                audio.pause();
            }
            if (currentInterval) clearInterval(currentInterval);
        } else {
            audio.volume = newVolume;
        }
    }, intervalTime);
  };

  const toggleSound = (soundId: string) => {
    if (soundId === 'focus-mode') {
        toggleFocusMode();
        // If a sound is playing, stop it when focus mode is activated
        if (activeSoundId && !isFocusMode) {
            const audio = audioRefs.current.get(activeSoundId);
            if (audio) fade(audio, 'out', masterVolume);
            setActiveSoundId(null);
        }
        return;
    }
    
    // If focus mode is on, don't play sounds
    if (isFocusMode) return;

    if (activeSoundId === soundId) {
      const audio = audioRefs.current.get(soundId);
      if (audio) fade(audio, 'out', masterVolume);
      setActiveSoundId(null);
      return;
    }

    if (activeSoundId) {
      const oldAudio = audioRefs.current.get(activeSoundId);
      if (oldAudio) fade(oldAudio, 'out', masterVolume);
    }
    
    const newAudio = audioRefs.current.get(soundId);
    if (newAudio) {
      fade(newAudio, 'in', masterVolume);
      setActiveSoundId(soundId);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setMasterVolume(newVolume);
    if (activeSoundId) {
      const audio = audioRefs.current.get(activeSoundId);
      if (audio && !audio.paused) {
        audio.volume = newVolume;
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      {sounds.map(sound => {
          const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
          const isActive = (activeSoundId === sound.id) || (sound.id === 'focus-mode' && isFocusMode);
          return (
            <Button 
                key={sound.id}
                variant="ghost"
                size="icon" 
                className="text-white/70 hover:bg-white/10 hover:text-white rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white"
                data-state={isActive ? 'active' : 'inactive'}
                onClick={() => toggleSound(sound.id)}
            >
              <Icon className="w-6 h-6" />
            </Button>
          );
      })}
      {activeSoundId && !isFocusMode && (
        <div className="flex items-center gap-2 w-32 ml-4">
            <Volume2 className="w-5 h-5 text-white/70"/>
            <Slider
                defaultValue={[masterVolume]}
                max={1}
                step={0.05}
                onValueChange={([value]) => handleVolumeChange(value)}
            />
        </div>
      )}
    </div>
  );
}
