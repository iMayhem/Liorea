// src/app/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfileAndRedirect = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.preparationPath) {
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
        } else {
          // If no path is set, go to the welcome page.
          router.push('/welcome');
        }
      } catch (error) {
        console.error("Error fetching user profile, redirecting to welcome:", error);
        router.push('/welcome');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileAndRedirect();

  }, [user, authLoading, router]);

  // Render a loading spinner while we determine where to redirect the user.
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
