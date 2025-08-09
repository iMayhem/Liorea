// src/app/welcome/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { setUserPreparationPath } from '@/lib/firestore';
import type { PreparationPath } from '@/lib/types';
import { AppLogo } from '@/components/icons';

export default function WelcomePage() {
  const { user, profile, loading: authLoading, loadingProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = React.useState<'initial' | 'neet-batch'>('initial');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (authLoading || loadingProfile) return;
    if (!user) {
      router.push('/login');
    } else if (!profile?.username) {
      router.push('/set-username');
    } else if (profile?.preparationPath) {
        router.push('/');
    }
  }, [user, profile, authLoading, loadingProfile, router]);


  const handleSelectPath = async (path: PreparationPath) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setUserPreparationPath(user.uid, path);
      await refreshProfile();
      router.push('/');
    } catch (error) {
      console.error("Error setting preparation path:", error);
      // Optionally, show a toast notification for the error
      setIsSaving(false);
    }
  };

  const handleNeetSelect = () => {
    setStep('neet-batch');
  };
  
  const handleJeeSelect = () => {
    handleSelectPath('jee');
  };

  if (authLoading || loadingProfile || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
          <CardTitle>Welcome, {profile.username || user.email}!</CardTitle>
          <CardDescription>
            {step === 'initial' 
              ? "Let's personalize your experience. Which exam are you preparing for?" 
              : "Great! Which NEET batch are you in?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'initial' && (
            <>
              <Button onClick={handleNeetSelect} className="w-full" disabled={isSaving}>
                NEET
              </Button>
              <Button onClick={handleJeeSelect} className="w-full" variant="secondary" disabled={isSaving}>
                 {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                JEE
              </Button>
            </>
          )}

          {step === 'neet-batch' && (
            <>
              <Button onClick={() => handleSelectPath('neet-achiever')} className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Achiever Batch
              </Button>
              <Button onClick={() => handleSelectPath('neet-other')} className="w-full" variant="secondary" disabled={isSaving}>
                Other NEET Batch
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
