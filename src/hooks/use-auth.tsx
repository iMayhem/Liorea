'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef} from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  loadingProfile: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const mounted = useRef(false);
  const profileRef = useRef<UserProfile | null>(null);

  // Keep ref synced
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const fetchProfile = useCallback(async (currentUser: any) => {
    if (!currentUser || !currentUser.id) return null;
    
    // Cache check (Skipped if profileRef is null, which refreshProfile ensures)
    if (profileRef.current && profileRef.current.uid === currentUser.id) {
        return profileRef.current;
    }

    setLoadingProfile(true);
    
    try {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (data) {
            const p = {
                uid: data.id,
                username: data.username,
                email: data.email,
                photoURL: data.photo_url,
                lastSeen: data.last_seen,
                role: data.role,
                feeling: data.feeling,
                isBlocked: data.is_blocked
            };
            if (mounted.current) setProfile(p);
            return p;
        } else {
            // Create profile if missing
            const googleAvatar = currentUser.user_metadata?.avatar_url;
            const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${currentUser.email}`;
            
            const newProfile = {
                id: currentUser.id,
                email: currentUser.email,
                photo_url: googleAvatar || defaultAvatar,
                last_seen: new Date().toISOString(),
                username: null 
            };
            
            const { error } = await supabase.from('users').insert(newProfile);
            if (!error) {
                const p = {
                    uid: newProfile.id,
                    username: null,
                    email: newProfile.email,
                    photoURL: newProfile.photo_url,
                    lastSeen: newProfile.last_seen
                };
                if (mounted.current) setProfile(p);
                return p;
            }
        }
    } catch (error) {
        console.error("[Auth] Fetch Error:", error);
    } finally {
        if (mounted.current) setLoadingProfile(false);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
        // FORCE REFRESH: Clear ref so next fetch actually goes to DB
        profileRef.current = null; 
        await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    mounted.current = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted.current) {
        if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user);
        }
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      if (session?.user) {
        setUser(session.user);
        // Only fetch if we are missing profile
        if (!profileRef.current) await fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        profileRef.current = null;
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Presence
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel('global_presence');
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ uid: user.id, online_at: new Date().toISOString() });
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Main Domain Redirect
  const signInWithGoogle = async () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const origin = isLocal ? 'http://localhost:3000' : 'https://liorea.netlify.app';
    const redirectUrl = `${origin}/auth/callback`;
    
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    profileRef.current = null;
    window.location.href = '/login';
  };

  const exposedUser = user ? { ...user, uid: user.id } : null;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: exposedUser, profile, loading, loadingProfile, signInWithGoogle, logout, refreshProfile }}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth error');
  return context;
}