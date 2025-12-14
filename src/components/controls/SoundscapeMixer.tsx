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
import dynamic from 'next/dynamic';

// Use any to bypass TS check on dynamic import props for now, or just use standard react-player
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;


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
    sounds.forEach(sound => {
      if (sound.id !== 'lofi' && sound.file && !audioRefs.current.has(sound.id)) {
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

    // Handle Lofi specifically (ReactPlayer)
    if (soundId === 'lofi') {
      if (activeSoundId === 'lofi') {
        setActiveSoundId(null);
      } else {
        // Stop others
        if (activeSoundId && activeSoundId !== 'lofi') {
          const oldAudio = audioRefs.current.get(activeSoundId);
          if (oldAudio) fade(oldAudio, 'out', masterVolume);
        }
        setActiveSoundId('lofi');
      }
      return;
    }

    if (activeSoundId === 'lofi') {
      setActiveSoundId(null);
      // Then continue to start new sound below
    }

    if (activeSoundId === soundId) {
      const audio = audioRefs.current.get(soundId);
      if (audio) fade(audio, 'out', masterVolume);
      setActiveSoundId(null);
      return;
    }

    if (activeSoundId && activeSoundId !== 'lofi') {
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


      {/* Invisible Player for Lofi (display:none blocks YT) */}
      <div className="fixed top-0 left-0 opacity-0 pointer-events-none w-px h-px overflow-hidden">
        {sounds.find(s => s.id === 'lofi') && (
          <ReactPlayer
            url={sounds.find(s => s.id === 'lofi')?.file}
            playing={activeSoundId === 'lofi'}
            volume={masterVolume}
            loop={true}
            width="100%"
            height="100%"
            config={{
              youtube: {
                playerVars: { controls: 0 }
              } as any

            }}
          />
        )}
      </div>
    </TooltipProvider >
  );
}
