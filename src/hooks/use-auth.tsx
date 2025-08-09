// src/hooks/use-auth.tsx
'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback} from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { upsertUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { StudyRoomProvider } from './use-study-room';
import type { UserProfile } from '@/lib/types';
import { useToast } from './use-toast';


interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
  // username is now part of the full profile
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loadingProfile: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    setLoadingProfile(true);
    try {
        const userProfile = await getUserProfile(uid);
        setProfile(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
    } finally {
        setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        const appUser: User = { uid, email, photoURL };
        setUser(appUser);
        
        // Upsert the basic profile info but don't set username here
        await upsertUserProfile(uid, {
            uid,
            email,
            photoURL: photoURL || '',
            lastSeen: new Date(),
            // Don't set username, it's handled on the set-username page
        });

        // Fetch the full profile from Firestore
        await fetchProfile(uid);

      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setLoadingProfile(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchProfile]);
  
  // Effect to periodically update the 'lastSeen' timestamp for the current user
  useEffect(() => {
    if (!user) return;

    // Set an interval to update the timestamp every 60 seconds
    const intervalId = setInterval(() => {
      updateUserProfile(user.uid, { lastSeen: new Date() });
    }, 60000); // 60 seconds

    // Cleanup the interval when the component unmounts or the user changes
    return () => clearInterval(intervalId);
  }, [user]);


  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setLoadingProfile(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    } finally {
      // setLoading will be handled by onAuthStateChanged
    }
  };

  const logout = async () => {
    if(user) {
        await updateUserProfile(user.uid, { lastSeen: new Date() });
    }
    setLoading(true);
    setLoadingProfile(true);
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
    } finally {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setLoadingProfile(false);
    }
  };
  
  const value = {user, profile, loading, loadingProfile, signInWithGoogle, logout, refreshProfile};

  return (
    <AuthContext.Provider value={value}>
        {loading ? (
            <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : children}
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

// Re-exporting StudyRoomProvider here to keep layout.tsx clean
export { StudyRoomProvider };
