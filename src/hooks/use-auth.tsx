// src/hooks/use-auth.tsx
'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface User {
  username: string;
  partner?: string; // Optional partner username
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
  setPartner: (partnerUsername: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for a saved user session
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = (username: string) => {
    // For this simple auth, we just create the user object
    const newUser: User = { username };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const setPartner = (partnerUsername: string) => {
    if (user) {
      const updatedUser = { ...user, partner: partnerUsername };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, login, logout, setPartner}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
