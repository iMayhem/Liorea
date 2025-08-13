// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, profile, loadingProfile } = useAuth();
  
  React.useEffect(() => {
    if (authLoading || loadingProfile) {
      return; // Wait for authentication and profile to resolve
    }

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!profile?.username) {
        router.push('/set-username');
        return;
    }
    
    // If everything is set, redirect to the new home page.
    router.push('/home');

  }, [user, authLoading, profile, loadingProfile, router]);

  // Render a loading spinner while we determine where to redirect the user.
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
