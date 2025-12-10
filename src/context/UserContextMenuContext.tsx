"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuPosition {
  x: number;
  y: number;
}

interface UserContextMenuContextType {
  isOpen: boolean;
  position: MenuPosition;
  targetUser: string | null;
  openMenu: (e: React.MouseEvent, username: string) => void;
  closeMenu: () => void;
}

const UserContextMenuContext = createContext<UserContextMenuContextType | undefined>(undefined);

export const UserContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetUser, setTargetUser] = useState<string | null>(null);

  const openMenu = (e: React.MouseEvent, username: string) => {
    e.preventDefault(); // Stop browser menu
    e.stopPropagation();
    
    setTargetUser(username);
    // Adjust position to keep it on screen (basic logic)
    const x = Math.min(e.clientX, window.innerWidth - 200); 
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setPosition({ x, y });
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setTargetUser(null);
  };

  return (
    <UserContextMenuContext.Provider value={{ isOpen, position, targetUser, openMenu, closeMenu }}>
      {children}
    </UserContextMenuContext.Provider>
  );
};

export const useUserContextMenu = () => {
  const context = useContext(UserContextMenuContext);
  if (context === undefined) throw new Error('useUserContextMenu must be used within a UserContextMenuProvider');
  return context;
};