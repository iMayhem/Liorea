"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthForm from '@/components/auth/AuthForm';
import { usePresence } from '@/context/PresenceContext';

export default function LandingPage() {
  const router = useRouter();
  const { setUsername } = usePresence();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = (username: string) => {
    setUsername(username);
    router.push('/home');
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 min-h-screen">
        {!showLogin ? (
          <Button
            size="lg"
            onClick={() => setShowLogin(true)}
            className="bg-black/20 hover:bg-black/40 text-white border border-white/30 backdrop-blur-md text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            Login
          </Button>
        ) : (
          <AuthForm onLogin={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
}
