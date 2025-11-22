'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Updated Fallback URL
const FALLBACK_BG = 'https://kbebktodjwmzclhtnvas.supabase.co/storage/v1/object/public/background/1.jpg';

interface BackgroundContextType {
  backgroundImage: string;
  isInitialLoading: boolean;
  refreshBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundImage, setBackgroundImage] = useState(FALLBACK_BG);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchBackground = useCallback(async () => {
      try {
          const { data, error } = await supabase
            .from('backgrounds')
            .select('url')
            .eq('is_active', true)
            .maybeSingle(); 
          
          if (data?.url) {
              const img = new Image();
              img.src = data.url;
              img.onload = () => {
                  setBackgroundImage(data.url);
                  setIsInitialLoading(false);
              };
              img.onerror = () => setIsInitialLoading(false);
          } else {
              setIsInitialLoading(false);
          }
      } catch (e) {
          setIsInitialLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchBackground();

    const channel = supabase.channel('public_backgrounds')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'backgrounds' }, (payload: any) => {
            if (payload.new.is_active) {
                setBackgroundImage(payload.new.url);
            }
        })
        .subscribe();

    // Force show content if DB is slow
    const timeout = setTimeout(() => setIsInitialLoading(false), 2000);

    return () => { 
        supabase.removeChannel(channel); 
        clearTimeout(timeout);
    };
  }, [fetchBackground]);

  return (
    <BackgroundContext.Provider value={{ backgroundImage, isInitialLoading, refreshBackground: fetchBackground }}>
        {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) throw new Error('useBackground error');
  return context;
}