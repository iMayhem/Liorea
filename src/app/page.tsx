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
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (userProfile) {
      if (!userProfile.preparationPath) {
        router.push('/welcome');
      } else {
        switch (userProfile.preparationPath) {
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
        }
      }
    }
  }, [userProfile, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
