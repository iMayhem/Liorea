
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
  isLoading: boolean;
  error: string | null;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [allFiles, setAllFiles] = useState<R2File[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [currentBackground, setCurrentBackground] = useState<Background | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Background fetching disabled for Native UI refactor
    setIsLoading(false);
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
    allFiles,
    isLoading,
    error,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [backgrounds, currentBackground, allFiles, isLoading, error]);

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
