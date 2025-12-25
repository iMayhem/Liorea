
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePresence } from '@/features/study';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { soundEffects } from '@/lib/sound-effects';

interface FocusContextType {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider = ({ children }: { children: ReactNode }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { username } = usePresence();

  const toggleFocusMode = () => {
    setIsFocusMode(prev => {
      const newValue = !prev;
      // Play sound when toggling
      soundEffects.play('focusToggle', 0.4);
      return newValue;
    });
  };

  // Sync focus mode to Firebase so other users can see it
  useEffect(() => {
    if (!username) return;

    const commRef = ref(db, `/community_presence/${username}`);
    update(commRef, { is_focus_mode: isFocusMode }).catch(err =>
      console.error("Failed to update focus mode status", err)
    );
  }, [isFocusMode, username]);

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
