// src/hooks/use-background.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const backgroundImages = [
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic.jpg?alt=media&token=7860393d-c6f3-45d5-a6e9-a6ca2a4d06a7',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic1.jpg?alt=media&token=494ecc4e-13e6-48b1-92f6-ccf90487fc30',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic3.jpg?alt=media&token=000879b1-2fb8-45cb-a9bb-37da1969a3fd',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic4.jpg?alt=media&token=869b5209-21f9-4e5e-9caf-154e8bd24b76',
  'https://firebasestorage.googleapis.com/v0/b/neet-trackr.firebasestorage.app/o/backgrounds%2Fpic7.jpeg?alt=media&token=14de565f-7157-4dff-ab60-b8b26aa03324',
];

interface BackgroundContextType {
  backgroundImage: string;
  isChanging: boolean;
  changeBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // On initial load, try to get the index from local storage
    const savedIndex = localStorage.getItem('backgroundIndex');
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10));
    }
  }, []);

  const changeBackground = () => {
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
    backgroundImage: backgroundImages[currentIndex],
    isChanging,
    changeBackground,
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
