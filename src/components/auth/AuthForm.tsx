"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Chrome, ArrowRight, ArrowLeft } from 'lucide-react'; 

interface AuthFormProps {
  onLogin: (username: string) => void;
}

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'google' | 'username'>('google');
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googlePhoto, setGooglePhoto] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState('');
  const { toast } = useToast();

  // 1. START GOOGLE LOGIN
  const handleGoogleStart = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email) throw new Error("No email found.");

      if (user.photoURL) localStorage.setItem('liorea-user-image', user.photoURL);
      setGooglePhoto(user.photoURL);

      const res = await fetch(`${WORKER_URL}/auth/google-check`, {
          method: 'POST',
          body: JSON.stringify({ email: user.email, photoURL: user.photoURL }),
          headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.exists) {
          toast({ title: 'Welcome back!', description: `Signed in as ${data.username}` });
          onLogin(data.username);
      } else {
          setGoogleEmail(user.email);
          setStep('username'); 
      }

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. FINALIZE SIGNUP
  const handleFinalizeSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customUsername.trim()) return;

      setIsLoading(true);
      try {
          const res = await fetch(`${WORKER_URL}/auth/google-create`, {
              method: 'POST',
              body: JSON.stringify({ 
                  email: googleEmail, 
                  username: customUsername.trim(),
                  photoURL: googlePhoto
              }),
              headers: { 'Content-Type': 'application/json' }
          });
          
          const data = await res.json();

          if (!res.ok || data.error) {
              throw new Error(data.error || "Failed to create account");
          }

          toast({ title: 'Welcome!', description: `Account created as ${data.username}` });
          onLogin(data.username);

      } catch (error: any) {
          toast({ variant: "destructive", title: "Username Unavailable", description: error.message });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <Card className="w-full max-w-sm bg-black/10 backdrop-blur-md border border-white/30 text-white shadow-lg transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Liorea</CardTitle>
        <CardDescription className="text-white/70">
          {step === 'google' ? "Sign in to join the community." : "Choose your unique username."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {step === 'google' && (
            <Button 
                onClick={handleGoogleStart} 
                className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 flex items-center gap-3"
                disabled={isLoading}
            >
                {isLoading ? "Checking..." : (
                    <>
                        <Chrome className="w-5 h-5" /> 
                        Continue with Google
                    </>
                )}
            </Button>
        )}

        {step === 'username' && (
            <form onSubmit={handleFinalizeSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                    <Input 
                        autoFocus
                        placeholder="e.g. study_wizard" 
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-xs text-white/50">This will be your display name on the leaderboard.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" variant="ghost" 
                        onClick={() => setStep('google')}
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1 bg-accent hover:bg-accent/90 text-white"
                        disabled={isLoading || customUsername.length < 3}
                    >
                        {isLoading ? "Creating..." : (
                            <>
                                Start Studying <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        )}

      </CardContent>

      <CardFooter className="justify-center text-xs text-white/50 text-center">
        {step === 'google' && "By continuing, you agree to join our study community."}
      </CardFooter>
    </Card>
  );
}