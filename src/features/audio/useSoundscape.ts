import { useState, useEffect, useRef } from 'react';
import { sounds, Sound } from '@/lib/sounds';

export function useSoundscape() {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  // Initialize Audio Objects
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
  }, []);

  // Fader Logic
  const fade = (audio: HTMLAudioElement, to: 'in' | 'out', targetVol: number) => {
    const startVol = audio.volume;
    const endVol = to === 'in' ? targetVol : 0;
    const steps = 20;
    const duration = 500; // ms
    const stepTime = duration / steps;
    const volStep = (endVol - startVol) / steps;

    if (to === 'in') {
        audio.volume = 0;
        audio.play().catch(() => {});
    }

    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        const newVol = startVol + (volStep * currentStep);
        
        // Clamp volume between 0 and 1
        audio.volume = Math.max(0, Math.min(1, newVol));

        if (currentStep >= steps) {
            clearInterval(interval);
            if (to === 'out') audio.pause();
            else audio.volume = targetVol; // Ensure exact target hit
        }
    }, stepTime);
  };

  const toggleSound = (soundId: string) => {
    // 1. If stopping current sound
    if (activeSoundId === soundId) {
      const audio = audioRefs.current.get(soundId);
      if (audio) fade(audio, 'out', volume);
      setActiveSoundId(null);
      return;
    }

    // 2. If switching from another sound
    if (activeSoundId) {
      const oldAudio = audioRefs.current.get(activeSoundId);
      if (oldAudio) fade(oldAudio, 'out', volume);
    }

    // 3. Play new sound
    const newAudio = audioRefs.current.get(soundId);
    if (newAudio) {
      fade(newAudio, 'in', volume);
      setActiveSoundId(soundId);
    }
  };

  const updateVolume = (newVol: number) => {
    setVolume(newVol);
    if (activeSoundId) {
        const audio = audioRefs.current.get(activeSoundId);
        if (audio) audio.volume = newVol;
    }
  };

  return { activeSoundId, toggleSound, volume, updateVolume };
}