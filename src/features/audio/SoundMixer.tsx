"use client";

import { useSoundscape } from './useSoundscape';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useFocus } from '@/context/FocusContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SoundMixer() {
  const { activeSoundId, toggleSound, volume, updateVolume } = useSoundscape();
  const { toggleFocusMode, isFocusMode } = useFocus();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {sounds.map(sound => {
            // Icon Lookup
            const Icon = LucideIcons[sound.icon as keyof typeof LucideIcons] as React.ElementType;
            const isFocus = sound.id === 'focus-mode';
            const isActive = isFocus ? isFocusMode : (activeSoundId === sound.id);

            return (
              <Tooltip key={sound.id}>
                <TooltipTrigger asChild>
                  <Button 
                      variant="ghost"
                      size="icon" 
                      onClick={() => isFocus ? toggleFocusMode() : toggleSound(sound.id)}
                      className={`rounded-full transition-all ${isActive ? 'bg-white text-black hover:bg-white/90' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{sound.name}</p>
                </TooltipContent>
              </Tooltip>
            );
        })}

        {/* Volume Slider (Only shows when a sound is playing) */}
        {activeSoundId && (
          <div className="flex items-center gap-2 w-24 ml-2 animate-in fade-in slide-in-from-left-2">
              <Volume2 className="w-4 h-4 text-white/50"/>
              <Slider
                  value={[volume]}
                  max={1}
                  step={0.05}
                  onValueChange={([val]) => updateVolume(val)}
                  className="cursor-pointer"
              />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}