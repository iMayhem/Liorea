import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface BackgroundItem {
  id: string;
  name: string;
  url: string;
}

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<BackgroundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBg, setCurrentBg] = useState<BackgroundItem | null>(null);

  // Load from API
  useEffect(() => {
    async function load() {
      try {
        // We reuse the gallery endpoint which returns { filename, url }
        const files = await api.media.getGifs(""); // Actually need a specific endpoint for backgrounds if it differs, 
                                                   // assuming api.media.getBackgrounds exists or we add it.
        
        // Let's assume we add a specific method to api.ts below for this
        const rawFiles = await fetch("https://r2-gallery-api.sujeetunbeatable.workers.dev/").then(r => r.json());
        
        const parsed = rawFiles
          .filter((f: any) => f.filename.startsWith('background/'))
          .map((f: any) => ({
            id: f.filename,
            name: f.filename.replace('background/', '').replace(/\.[^/.]+$/, ""),
            url: f.url
          }));

        setBackgrounds(parsed);
        
        // Set random initial
        if (parsed.length > 0) {
            const random = parsed[Math.floor(Math.random() * parsed.length)];
            setCurrentBg(random);
        }
      } catch (e) {
        console.error("Failed to load backgrounds", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const cycleBackground = () => {
    if (backgrounds.length < 2) return;
    const idx = backgrounds.findIndex(b => b.id === currentBg?.id);
    const next = backgrounds[(idx + 1) % backgrounds.length];
    setCurrentBg(next);
  };

  return { backgrounds, currentBg, cycleBackground, isLoading };
}