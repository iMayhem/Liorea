"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Chrome } from 'lucide-react'; // Icon for Google

interface AuthFormProps {
  onLogin: (username: string) => void;
}

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Open Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Use the part before the email @ as the username (e.g., "john" from john@gmail.com)
      // Or use user.displayName if you prefer spaces
      const username = user.displayName || user.email?.split('@')[0] || "Anonymous";

      // 2. IMPORTANT: Sync with Cloudflare D1
      // We send this to your worker so it creates a row in the 'users' table 
      // This ensures the leaderboard works!
      await fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ 
            username: username, 
            status_text: "Joined via Google" // Initial status
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      toast({
        title: 'Login Successful',
        description: `Welcome, ${username}!`,
      });

      // 3. Enter the App
      onLogin(username);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-black/10 backdrop-blur-md border border-white/30 text-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Liorea</CardTitle>
        <CardDescription className="text-white/70">
          Sign in to track your study hours and join the leaderboard.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
            onClick={handleGoogleLogin} 
            className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 flex items-center gap-3"
            disabled={isLoading}
        >
            {isLoading ? (
                "Signing in..."
            ) : (
                <>
                    <Chrome className="w-5 h-5" /> {/* Using Chrome icon as Google proxy */}
                    Continue with Google
                </>
            )}
        </Button>
      </CardContent>

      <CardFooter className="justify-center text-xs text-white/50 text-center">
        By continuing, you agree to join our study community.
      </CardFooter>
    </Card>
  );
}