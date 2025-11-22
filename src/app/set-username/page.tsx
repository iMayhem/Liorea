'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from 'use-debounce';
import { checkUsernameUnique, updateUserProfile } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export default function SetUsernamePage() {
    const { user, loading, loadingProfile, profile, refreshProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [username, setUsername] = React.useState('');
    const [status, setStatus] = React.useState<UsernameStatus>('idle');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        // If profile is loaded AND has username, leave
        if (!loadingProfile && profile?.username) {
            router.push('/');
        }
    }, [user, loading, loadingProfile, profile, router]);


    const checkUsername = useDebouncedCallback(async (name: string) => {
        if (name.length < 3) { setStatus('idle'); return; }
        setStatus('checking');
        const isUnique = await checkUsernameUnique(name);
        setStatus(isUnique ? 'available' : 'unavailable');
    }, 500);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(value);
        if(value.length > 2) checkUsername(value);
        else setStatus('idle');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'available' || !user) return;
        
        setIsSaving(true);
        
        try {
            // 1. Update DB
            const { error } = await updateUserProfile(user.uid, { username });
            
            if (error) {
                throw new Error(error);
            }

            // 2. Refresh Profile to get new data
            await refreshProfile(); 
            
            toast({ title: 'Username Set!', description: `Welcome, ${username}!` });
            
            // 3. Redirect only after success
            router.push('/'); 
            
        } catch (error: any) {
            console.error("Save error:", error);
            toast({ 
                title: 'Error', 
                description: error.message || 'Could not save username. Please try another.', 
                variant: 'destructive' 
            });
            // Reset status to force re-check or re-entry
            setStatus('idle');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || loadingProfile || profile?.username) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <div className="flex justify-center mb-4"><AppLogo /></div>
                    <CardTitle>Choose Username</CardTitle>
                    <CardDescription>This will be your unique identifier.</CardDescription>
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
                                    placeholder="e.g. study_wizard"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {status === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {status === 'unavailable' && <XCircle className="h-4 w-4 text-destructive" />}
                                </div>
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