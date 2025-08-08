// src/hooks/use-background.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const backgroundImages = [
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic.jpg?alt=media&token=7860393d-c6f3-45d5-a6e9-a6ca2a4d06a7',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic1.jpg?alt=media&token=494ecc4e-13e6-48b1-92f6-ccf90487fc30',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic3.jpg?alt=media&token=000879b1-2fb8-45cb-a9bb-37da1969a3fd',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic4.jpg?alt=media&token=869b5209-21f9-4e5e-9caf-154e8bd24b76',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic7.jpeg?alt=media&token=14de565f-7157-4dff-ab60-b8b26aa03324',
];

const CUSTOM_BG_KEY = 'customBackgroundImage';

interface BackgroundContextType {
  backgroundImage: string;
  isChanging: boolean;
  changeBackground: () => void;
  setCustomBackground: (dataUrl: string) => void;
  clearCustomBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [customBackground, _setCustomBackground] = useState<string | null>(null);

  useEffect(() => {
    // On initial load, try to get custom bg from local storage first
    const savedCustomBg = localStorage.getItem(CUSTOM_BG_KEY);
    if (savedCustomBg) {
      _setCustomBackground(savedCustomBg);
    } else {
      // Otherwise, get the default index from local storage
      const savedIndex = localStorage.getItem('backgroundIndex');
      if (savedIndex) {
        setCurrentIndex(parseInt(savedIndex, 10));
      }
    }
  }, []);
  
  const setCustomBackground = (dataUrl: string) => {
    try {
        localStorage.setItem(CUSTOM_BG_KEY, dataUrl);
        _setCustomBackground(dataUrl);
    } catch(error) {
        console.error("Could not save custom background:", error);
        alert("Could not save background. Your browser storage might be full.");
    }
  };
  
  const clearCustomBackground = useCallback(() => {
    if(localStorage.getItem(CUSTOM_BG_KEY)){
      localStorage.removeItem(CUSTOM_BG_KEY);
      _setCustomBackground(null);
    }
  }, []);

  const changeBackground = () => {
    if (customBackground) {
        // If a custom background is set, this function will now clear it
        // and revert to the first default image.
        clearCustomBackground();
        setCurrentIndex(0);
        localStorage.setItem('backgroundIndex', '0');
        return;
    }
    
    setIsChanging(true);
    const nextIndex = (currentIndex + 1) % backgroundImages.length;
    
    // Preload the next image
    const img = new Image();
    img.src = backgroundImages[nextIndex];
    img.onload = () => {
      setCurrentIndex(nextIndex);
      localStorage.setItem('backgroundIndex', nextIndex.toString());
      setIsChanging(false);
    };
    img.onerror = () => {
        // Handle error if image fails to load
        setIsChanging(false);
    }
  };

  const value = {
    backgroundImage: customBackground || backgroundImages[currentIndex],
    isChanging,
    changeBackground,
    setCustomBackground,
    clearCustomBackground
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
