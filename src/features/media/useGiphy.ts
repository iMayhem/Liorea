import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

// Types for Giphy Response
export type GiphyImage = {
  id: string;
  images: {
    fixed_height: { url: string };
    original: { url: string };
  }
};

export function useGiphy() {
  const [gifs, setGifs] = useState<GiphyImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query: string = "") => {
    setIsLoading(true);
    try {
      const data = await api.media.getGifs(query);
      setGifs(data.data || []);
    } catch (e) {
      console.error("Giphy Error:", e);
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { gifs, search, isLoading };
}