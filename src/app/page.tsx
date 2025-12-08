"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 min-h-screen">
        <Button
          size="lg"
          onClick={goToHome}
          className="bg-black/20 hover:bg-black/40 text-white border border-white/30 backdrop-blur-md text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          Enter Workspace
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
