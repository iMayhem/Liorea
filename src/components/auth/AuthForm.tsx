"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface AuthFormProps {
  onLogin: (username: string) => void;
}

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? 'login' : 'signup';
    
    try {
      const response = await fetch(`${WORKER_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong');
      }

      // If signup was successful, show toast, switch to login view, and stop.
      if (!isLogin) {
          toast({
            title: 'Sign Up Successful',
            description: 'You can now log in with your new credentials.',
          });
          setIsLogin(true);
          setPassword('');
          setIsLoading(false);
          return; // IMPORTANT: Stop execution here
      }

      // This part will only run for a successful login
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      onLogin(username);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm bg-black/10 backdrop-blur-md border border-white/30 text-white shadow-lg">
      <CardHeader>
        <CardTitle>{isLogin ? 'Welcome Back!' : 'Join Liorea'}</CardTitle>
        <CardDescription>{isLogin ? 'Log in to continue your session.' : 'Sign up to join the study community.'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleAuth}>
        <CardContent className="space-y-4">
          {error && (
              <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>{isLogin ? 'Login' : 'Sign-up'} Failed</AlertTitle>
                  <AlertDescription>
                      {error}
                  </AlertDescription>
              </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="bg-transparent border-white/30 placeholder:text-white/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-transparent border-white/30 placeholder:text-white/70"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full bg-primary/80 hover:bg-primary text-white" disabled={isLoading}>
            {isLoading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Log In' : 'Sign Up')}
          </Button>
          <p className="text-xs text-center text-white/80">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="underline font-semibold hover:text-white">
                  {isLogin ? 'Sign up' : 'Log in'}
              </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
