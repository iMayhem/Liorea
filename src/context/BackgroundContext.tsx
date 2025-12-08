"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { backgrounds as availableBackgrounds, Background } from '@/lib/backgrounds';

interface BackgroundContextType {
  backgrounds: Background[];
  currentBackground: Background;
  setCurrentBackgroundById: (id: string) => void;
  cycleBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [currentBackground, setCurrentBackground] = useState<Background>(availableBackgrounds[0]);

  const setCurrentBackgroundById = (id: string) => {
    const newBg = availableBackgrounds.find(bg => bg.id === id);
    if (newBg) {
      setCurrentBackground(newBg);
    }
  };

  const cycleBackground = () => {
    const currentIndex = availableBackgrounds.findIndex(bg => bg.id === currentBackground.id);
    const nextIndex = (currentIndex + 1) % availableBackgrounds.length;
    setCurrentBackground(availableBackgrounds[nextIndex]);
  };
  
  const value = useMemo(() => ({
    backgrounds: availableBackgrounds,
    currentBackground,
    setCurrentBackgroundById,
    cycleBackground
  }), [currentBackground]);

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
