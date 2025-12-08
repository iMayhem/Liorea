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
    async function loadFiles() {
      console.log('[DEBUG] Starting to load files from worker...');
      try {
        const response = await fetch(`${WORKER_URL}/`);
        console.log('[DEBUG] Worker response received:', response);

        if (!response.ok) {
          throw new Error(`Worker responded with status ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text(); 
            console.error("[DEBUG] Worker response was not JSON:", text);
            throw new Error("Received invalid data format from server");
        }

        const files: R2File[] = await response.json();
        console.log('[DEBUG] Parsed files from worker:', files);
        
        if (!Array.isArray(files)) {
          console.error("[DEBUG] Worker did not return a valid JSON array.");
          return;
        }

        const validFiles = files.filter(file => !file.filename.endsWith('/'));
        setAllFiles(validFiles);
        console.log('[DEBUG] Set all valid files:', validFiles);

        const fetchedBackgrounds = validFiles
          .filter(file => file.filename.startsWith('background/'))
          .map(file => ({
            id: file.filename,
            name: file.filename.replace('background/', '').split('.')[0].replace(/[-_]/g, ' '),
            url: file.url,
          }));
        
        console.log('[DEBUG] Filtered background images:', fetchedBackgrounds);

        if (fetchedBackgrounds.length > 0) {
          setBackgrounds(fetchedBackgrounds);
          if (!currentBackground) {
            setCurrentBackground(fetchedBackgrounds[0]);
            console.log('[DEBUG] Set initial background:', fetchedBackgrounds[0]);
          }
        } else {
            console.log('[DEBUG] No background images found in worker response.');
        }
        console.log('[DEBUG] File loading process finished.');
      } catch (err: any) {
        console.error("[DEBUG] Failed to load files from worker:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
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
