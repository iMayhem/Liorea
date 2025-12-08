"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { usePresence } from '@/context/PresenceContext';
import { BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const { setUsername } = usePresence();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleLoginSuccess = (username: string) => {
    setUsername(username);
    router.push('/home');
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 min-h-screen">
        {showAuthForm ? (
          <AuthForm onLogin={handleLoginSuccess} />
        ) : (
          <div className="w-full max-w-sm bg-black/10 backdrop-blur-md border border-white/30 text-white shadow-lg rounded-lg p-8 flex flex-col items-center gap-6">
            <BookOpenCheck className="w-16 h-16 text-white" />
            <div className="text-center">
              <h1 className="text-4xl font-bold">Liorea</h1>
              <p className="text-white/80 mt-2">Your cozy corner to study & connect.</p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAuthForm(true)}
              className="w-full bg-google-blue hover:bg-google-blue/90 text-white text-lg"
            >
              Start
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
