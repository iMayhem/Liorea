// src/app/login/page.tsx
'use client';
import * as React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {AppLogo} from '@/components/icons';
import {Loader2} from 'lucide-react';

export default function LoginPage() {
  const {user, login, loading} = useAuth();
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (username.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
    }
    // Basic alphanumeric check
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        setError('Username can only contain letters and numbers.');
        return;
    }
    setError('');
    login(username);
  };
  
  if (loading || user) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle>Welcome to NEET Trackr</CardTitle>
          <CardDescription>Enter your username to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="YourUniqueUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
             {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
