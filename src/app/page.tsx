"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 min-h-screen bg-black/30">
        <div className="p-4 bg-primary/20 border border-primary/30 rounded-full mb-6">
            <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
          Welcome to Liorea
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground mb-8">
          Your personalized virtual workspace for focus and productivity. Join a community of learners and achieve your goals together.
        </p>
        <Button
          size="lg"
          onClick={goToHome}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 transition-transform transform hover:scale-105"
        >
          Enter Workspace
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
