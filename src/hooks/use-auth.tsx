// src/hooks/use-auth.tsx
'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';

interface User {
  uid: string;
  username: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        const appUser: User = { uid, username: displayName, email, photoURL };
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user state
    } catch (error) {
      console.error("Error during sign-in:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, signInWithGoogle, logout}}>
      {!loading && children}
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
