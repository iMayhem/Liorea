
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

interface GlobalTimerContextType {
  startTime: number; // Stored as a Unix timestamp (milliseconds)
  elapsedTime: number; // Stored in seconds
  resetGlobalTimer: () => Promise<void>;
  isResetting: boolean;
  isLoading: boolean;
}

const GlobalTimerContext = createContext<GlobalTimerContextType | undefined>(undefined);

export const GlobalTimerProvider = ({ children }: { children: ReactNode }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStartTime = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${WORKER_URL}/timer/status`);
      if (response.ok) {
        const data = await response.json();
        // Assuming the worker returns startTime in milliseconds
        setStartTime(data.startTime || Date.now()); 
      } else {
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("Failed to fetch timer status, using local time.", error);
      setStartTime(Date.now());
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartTime();
  }, [fetchStartTime]);
  
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed > 0 ? elapsed : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isLoading]);

  const resetGlobalTimer = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`${WORKER_URL}/timer/reset`, {
        method: "POST",
      });
      if (response.ok) {
        // Refetch start time to sync with server
        await fetchStartTime();
      } else {
          throw new Error('Failed to reset timer on the server.');
      }
    } catch (error) {
      console.error("Error resetting global timer:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <GlobalTimerContext.Provider value={{ startTime, elapsedTime, resetGlobalTimer, isResetting, isLoading }}>
      {children}
    </GlobalTimerContext.Provider>
  );
};

export const useGlobalTimer = () => {
  const context = useContext(GlobalTimerContext);
  if (context === undefined) {
    throw new Error('useGlobalTimer must be used within a GlobalTimerProvider');
  }
  return context;
};
