"use client";
import { useState, useEffect, useRef } from 'react';
import type { Sound } from '@/lib/sounds';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Volume2 } from 'lucide-react';
import { useFocus } from '@/context/FocusContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { lofiOptions } from '@/lib/sounds';



interface SoundscapeMixerProps {
  sounds: Sound[];
  sidebarMode?: boolean;
}

export default function SoundscapeMixer({ sounds, sidebarMode = false }: SoundscapeMixerProps) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const { toggleFocusMode, isFocusMode } = useFocus();

  useEffect(() => {
    [...sounds, ...lofiOptions].forEach(sound => {
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
      return;
    }



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
    <TooltipProvider>
      <div className={`flex ${sidebarMode ? 'flex-col gap-4' : 'items-center gap-2'}`}>
        {sounds.map(sound => {
          const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
          const isActive = (activeSoundId === sound.id) || (sound.id === 'focus-mode' && isFocusMode);

          if (sound.id === 'lofi-group') {
            const isLofiActive = lofiOptions.some(opt => opt.id === activeSoundId);
            return (
              <DropdownMenu key={sound.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-zinc-400 hover:bg-[#313338] hover:text-white rounded-[16px] w-12 h-12 transition-all ${isLofiActive ? 'bg-[#313338] text-green-400 shadow-sm border border-green-500/20' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="bg-[#1e1e24] border-white/10 text-white min-w-[150px]">
                  {lofiOptions.map(option => (
                    <DropdownMenuItem
                      key={option.id}
                      className={`cursor-pointer hover:bg-white/10 focus:bg-white/10 ${activeSoundId === option.id ? 'text-green-400' : ''}`}
                      onClick={() => toggleSound(option.id)}
                    >
                      <span className="flex-1">{option.name}</span>
                      {activeSoundId === option.id && <div className="w-2 h-2 rounded-full bg-green-400 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Tooltip key={sound.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-zinc-400 hover:bg-[#313338] hover:text-white rounded-[16px] w-12 h-12 transition-all ${isActive ? 'bg-[#313338] text-green-400 shadow-sm border border-green-500/20' : ''}`}
                  onClick={() => toggleSound(sound.id)}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{sound.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {activeSoundId && !isFocusMode && !sidebarMode && (
          <div className="flex items-center gap-2 w-32 ml-4">
            <Volume2 className="w-5 h-5 text-white/70" />
            <Slider
              defaultValue={[masterVolume]}
              max={1}
              step={0.05}
              onValueChange={([value]) => handleVolumeChange(value)}
            />
          </div>
        )}
      </div>



    </TooltipProvider >
  );
}
