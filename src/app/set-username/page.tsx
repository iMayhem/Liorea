// src/app/set-username/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from 'use-debounce';
import { checkUsernameUnique, updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export default function SetUsernamePage() {
    const { user, loading: authLoading, profile, loadingProfile, refreshProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [username, setUsername] = React.useState('');
    const [status, setStatus] = React.useState<UsernameStatus>('idle');
    const [isSaving, setIsSaving] = React.useState(false);

    // Redirect if user is not logged in or already has a username
    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!loadingProfile && profile?.username) {
            router.push('/');
        }
    }, [user, authLoading, profile, loadingProfile, router]);


    const checkUsername = useDebouncedCallback(async (name: string) => {
        if (name.length < 3) {
            setStatus('idle');
            return;
        }
        setStatus('checking');
        const isUnique = await checkUsernameUnique(name);
        setStatus(isUnique ? 'available' : 'unavailable');
    }, 500);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(value);
        if(value.length > 2) {
            checkUsername(value);
        } else {
            setStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'available' || !user) {
            toast({
                title: 'Invalid Username',
                description: 'Please choose a unique username that is at least 3 characters long.',
                variant: 'destructive',
            });
            return;
        }
        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, { username });
            await refreshProfile(); // Refresh the auth context
            toast({
                title: 'Username Set!',
                description: `Welcome, ${username}!`,
            });
            router.push('/'); // Redirect to home page to continue onboarding
        } catch (error) {
            console.error('Error setting username:', error);
            toast({
                title: 'Error',
                description: 'Could not set your username. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || loadingProfile || (!loadingProfile && profile?.username)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const getStatusIndicator = () => {
        switch (status) {
            case 'checking':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'available':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'unavailable':
                return <XCircle className="h-4 w-4 text-destructive" />;
            default:
                return null;
        }
    };

    const getStatusMessage = () => {
         switch (status) {
            case 'checking':
                return <p className="text-xs text-muted-foreground">Checking availability...</p>;
            case 'available':
                return <p className="text-xs text-green-500">Username is available!</p>;
            case 'unavailable':
                return <p className="text-xs text-destructive">This username is already taken.</p>;
            default:
                if(username.length > 0 && username.length < 3) {
                     return <p className="text-xs text-destructive">Username must be at least 3 characters.</p>;
                }
                return <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and underscores.</p>;
        }
    }


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen bg-transparent p-4"
        >
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AppLogo />
                    </div>
                    <CardTitle>Choose Your Username</CardTitle>
                    <CardDescription>This will be your unique identifier across the app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                             <div className="relative">
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {getStatusIndicator()}
                                </div>
                            </div>
                            <div className="h-4 mt-1">
                                {getStatusMessage()}
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSaving || status !== 'available'}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Username
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
