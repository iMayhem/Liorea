"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

export type Background = {
  id: string;
  name: string;
  url: string;
};

export type R2File = {
  filename: string;
  url: string;
}

interface BackgroundContextType {
  backgrounds: Background[];
  currentBackground: Background | null;
  setCurrentBackgroundById: (id: string) => void;
  cycleBackground: () => void;
  allFiles: R2File[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev/";

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [allFiles, setAllFiles] = useState<R2File[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [currentBackground, setCurrentBackground] = useState<Background | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await fetch(WORKER_URL);
        const files: R2File[] = await response.json();
        
        const validFiles = files.filter(file => !file.filename.endsWith('/'));
        setAllFiles(validFiles);

        const fetchedBackgrounds = validFiles
          .filter(file => file.filename.startsWith('background/'))
          .map(file => ({
            id: file.filename,
            name: file.filename.replace('background/', '').split('.')[0].replace(/[-_]/g, ' '),
            url: file.url,
          }));

        if (fetchedBackgrounds.length > 0) {
          setBackgrounds(fetchedBackgrounds);
          if (!currentBackground) {
            setCurrentBackground(fetchedBackgrounds[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load files from worker:", error);
      }
    }
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    cycleBackground,
    allFiles
  }), [backgrounds, currentBackground, allFiles]);

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
