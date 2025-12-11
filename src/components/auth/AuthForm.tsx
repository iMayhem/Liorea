"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Chrome, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'; 
import { usePresence } from '@/context/PresenceContext';
import { GlassCard } from '@/features/ui/GlassCard'; // Use our new UI
import { api } from '@/lib/api'; // Use our new API

interface AuthFormProps {
  onLogin: (username: string) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const { setUserImage } = usePresence();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'google' | 'username'>('google');
  
  // Temp storage during signup flow
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googlePhoto, setGooglePhoto] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState('');
  
  const { toast } = useToast();

  // 1. Google Auth Step
  const handleGoogleStart = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email) throw new Error("No email found.");

      // Store image immediately for UI responsiveness
      if (user.photoURL) {
          localStorage.setItem('liorea-user-image', user.photoURL);
          setGooglePhoto(user.photoURL);
          setUserImage(user.photoURL);
      }

      // Check if user exists via API
      const data = await api.auth.checkGoogle(user.email, user.photoURL);

      if (data.exists) {
          toast({ title: 'Welcome back!', description: `Signed in as ${data.username}` });
          onLogin(data.username);
      } else {
          // New User -> Go to Username step
          setGoogleEmail(user.email);
          setStep('username'); 
      }

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Username Creation Step
  const handleFinalizeSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customUsername.trim()) return;

      setIsLoading(true);
      try {
          const data = await api.auth.createAccount({
              email: googleEmail, 
              username: customUsername.trim(),
              photoURL: googlePhoto
          });

          if (data.success) {
              toast({ title: 'Welcome!', description: `Account created as ${data.username}` });
              onLogin(data.username);
          }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Username Unavailable", description: "Please try a different username." });
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <GlassCard variant="panel" className="w-full max-w-sm p-8 flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Liorea</h1>
        <p className="text-white/50 text-sm">
          {step === 'google' ? "Your virtual study sanctuary." : "Choose your unique identity."}
        </p>
      </div>
      
      <div className="space-y-4">
        {step === 'google' && (
            <Button 
                onClick={handleGoogleStart} 
                className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 flex items-center gap-3 transition-transform hover:scale-[1.02]"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Chrome className="w-5 h-5" />}
                {isLoading ? "Connecting..." : "Continue with Google"}
            </Button>
        )}

        {step === 'username' && (
            <form onSubmit={handleFinalizeSignup} className="space-y-6 animate-in fade-in slide-in-from-right-8">
                <div className="space-y-2">
                    <Input 
                        autoFocus
                        placeholder="username" 
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        className="bg-black/20 border-white/20 text-white text-center text-lg h-12 focus-visible:ring-white/20"
                    />
                    <p className="text-[10px] text-white/40 text-center uppercase tracking-widest">
                        This will be visible on the leaderboard
                    </p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <Button 
                        type="submit" 
                        className="w-full bg-white text-black hover:bg-white/90 font-bold h-11"
                        disabled={isLoading || customUsername.length < 3}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>Start Studying <ArrowRight className="ml-2 w-4 h-4" /></>
                        )}
                    </Button>
                    
                    <Button 
                        type="button" variant="link" 
                        onClick={() => setStep('google')}
                        disabled={isLoading}
                        className="text-white/50 hover:text-white text-xs"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" /> Back
                    </Button>
                </div>
            </form>
        )}
      </div>
    </GlassCard>
  );
}