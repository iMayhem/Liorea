"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/features/auth/components/AuthForm';
import { usePresence } from '@/shared/context/PresenceContext';
import { useBackground } from '@/shared/context/BackgroundContext';
import { Skeleton } from '@/shared/ui/skeleton';

export default function LandingPage() {
  const router = useRouter();
  const { username, setUsername } = usePresence();
  const { isLoading: isBackgroundLoading } = useBackground();

  // Automatic Redirect Logic
  useEffect(() => {
    // If background is done loading AND we have a username, go to home
    if (!isBackgroundLoading && username) {
        router.push('/home');
    }
  }, [isBackgroundLoading, username, router]);

  const handleLoginSuccess = (newUsername: string) => {
    setUsername(newUsername);
    router.push('/home');
  };

  // Show a loading skeleton while checking auth or redirecting
  // This prevents the Login form from flashing briefly if the user is already logged in
  if (isBackgroundLoading || username) {
    return <Skeleton className="h-screen w-screen bg-transparent" />;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 min-h-screen">
        {/* Directly show the AuthForm */}
        <AuthForm onLogin={handleLoginSuccess} />
      </div>
    </div>
  );
}