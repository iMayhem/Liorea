// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, profile, loadingProfile } = useAuth();
  
  React.useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to resolve first
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // If user is authenticated, wait for their profile to finish loading
    if (loadingProfile) {
        return;
    }

    // At this point, we know the user is logged in and profile loading is complete.
    // Now we can safely check the profile fields.
    if (!profile?.username) {
        router.push('/set-username');
        return;
    }

    if (!profile.preparationPath) {
        router.push('/welcome');
        return;
    }
    
    // If everything is set, redirect to the correct home page.
    switch (profile.preparationPath) {
        case 'neet-achiever':
          router.push('/neet-achiever-home');
          break;
        case 'neet-other':
          router.push('/neet-home');
          break;
        case 'jee':
          router.push('/jee-home');
          break;
        default:
          // Fallback to the welcome page if path is somehow invalid
          router.push('/welcome'); 
          break;
    }

  }, [user, authLoading, profile, loadingProfile, router]);

  // Render a loading spinner while we determine where to redirect the user.
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
