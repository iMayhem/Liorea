
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FocusContextType {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider = ({ children }: { children: ReactNode }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev);
  };

  return (
    <FocusContext.Provider value={{ isFocusMode, toggleFocusMode }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
