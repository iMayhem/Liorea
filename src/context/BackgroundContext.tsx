"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

export type Background = {
  id: string;
  name: string;
  url: string;
};

interface BackgroundContextType {
  backgrounds: Background[];
  currentBackground: Background | null;
  setCurrentBackgroundById: (id: string) => void;
  cycleBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [currentBackground, setCurrentBackground] = useState<Background | null>(null);

  useEffect(() => {
    async function loadBackgrounds() {
      try {
        const response = await fetch(WORKER_URL);
        const files: { filename: string; url: string }[] = await response.json();
        
        const fetchedBackgrounds = files
          .filter(file => !file.filename.endsWith('/'))
          .map(file => ({
            id: file.filename,
            name: file.filename.replace('background/', '').split('.')[0].replace(/[-_]/g, ' '),
            url: file.url,
          }));

        if (fetchedBackgrounds.length > 0) {
          setBackgrounds(fetchedBackgrounds);
          setCurrentBackground(fetchedBackgrounds[0]);
        }
      } catch (error) {
        console.error("Failed to load backgrounds from worker:", error);
      }
    }
    loadBackgrounds();
  }, []);

  const setCurrentBackgroundById = (id: string) => {
    const newBg = backgrounds.find(bg => bg.id === id);
    if (newBg) {
      setCurrentBackground(newBg);
    }
  };

  const cycleBackground = () => {
    if (!currentBackground || backgrounds.length === 0) return;
    const currentIndex = backgrounds.findIndex(bg => bg.id === currentBackground.id);
    const nextIndex = (currentIndex + 1) % backgrounds.length;
    setCurrentBackground(backgrounds[nextIndex]);
  };
  
  const value = useMemo(() => ({
    backgrounds,
    currentBackground,
    setCurrentBackgroundById,
    cycleBackground
  }), [backgrounds, currentBackground]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
