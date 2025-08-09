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
    if (authLoading || loadingProfile) {
      return; // Wait until we have auth and profile info
    }
    if (!user) {
      router.push('/login');
      return;
    }

    // 1. Check if username is set. If not, redirect to set-username.
    if (!profile?.username) {
        router.push('/set-username');
        return;
    }

    // 2. Check if preparation path is set. If not, redirect to welcome.
    if (!profile?.preparationPath) {
        router.push('/welcome');
        return;
    }
    
    // 3. If everything is set, redirect to the correct home page.
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
          router.push('/welcome'); // Fallback
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
