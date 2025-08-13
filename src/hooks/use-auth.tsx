// src/hooks/use-auth.tsx
'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback} from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { upsertUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { useToast } from './use-toast';
import { Timestamp, doc, getDoc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';


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
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [signInPending, setSignInPending] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProfile = useCallback(async (uid: string) => {
    setLoadingProfile(true);
    try {
        const userProfile = await getUserProfile(uid);
        setProfile(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ title: "Error", description: "Failed to load your profile.", variant: "destructive" });
        setProfile(null);
    } finally {
        setLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setSignInPending(false); // Authentication attempt is complete
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        const appUser: User = { uid, email, photoURL };
        
        setUser(appUser);
        setLoading(false); // Auth loading is complete

        // Upsert basic user info first
        await upsertUserProfile(uid, {
            uid,
            email,
            photoURL: photoURL || '',
            lastSeen: new Date(),
        });

        await fetchProfile(uid);

      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setLoadingProfile(false);
      }
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
    
    // Also update when user becomes visible again (e.g. switches back to the tab)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            updateUserProfile(user.uid, { lastSeen: new Date() });
        }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup the interval when the component unmounts or the user changes
    return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [user]);


  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const signInWithGoogle = async () => {
    setSignInPending(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
          console.error("Error during sign-in:", error);
           toast({
                title: 'Sign-in Failed',
                description: 'Could not sign in with Google. Please try again.',
                variant: 'destructive',
            });
      }
      setSignInPending(false);
    }
  };

  const logout = async () => {
    if(user && profile) {
        const userStatus = profile.status;
        if(userStatus?.roomId) {
            const roomType = userStatus.isStudying ? 'studyRooms' : 'jamRooms';
            const roomRef = doc(db, roomType, userStatus.roomId);
            const roomSnap = await getDoc(roomRef);
            if(roomSnap.exists()){
                const participantData = { uid: user.uid, username: profile.username, photoURL: profile.photoURL };
                 await updateDoc(roomRef, { 
                    participants: arrayRemove(participantData),
                    [`typingUsers.${user.uid}`]: deleteField()
                });
            }
        }
        await updateUserProfile(user.uid, { lastSeen: new Date(), status: { isStudying: false, isJamming: false, roomId: null, isBeastMode: false } });
    }
    await signOut(auth);
  };
  
  const value = {user, profile, loading, loadingProfile, signInWithGoogle, logout, refreshProfile};

  if (!isClient || (loading && !signInPending)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
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
