"use client";

import { PresencePanel, WelcomePanel, StatusPanel, usePresence } from '@/features/study';
import Header from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { useBackground } from '@/context/BackgroundContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { ErrorBoundary } from './ui/ErrorBoundary';
import VersionInfo from './VersionInfo';
import ExamCountdown from './ExamCountdown';

export default function LioreaClient() {
  const { error, isLoading: isBackgroundLoading } = useBackground();
  const { communityUsers, username } = usePresence();
  const router = useRouter();
  const nextYear = new Date().getFullYear() + 1;

  const jeeTargetDate = useMemo(() => new Date(`${nextYear}-01-24T09:00:00`), [nextYear]);
  const jeeSession2TargetDate = useMemo(() => new Date(`${nextYear}-04-01T09:00:00`), [nextYear]);
  const neetTargetDate = useMemo(() => new Date(`${nextYear}-05-05T14:00:00`), [nextYear]);

  useEffect(() => {
    // If the background is done loading and we find there's no user, redirect.
    if (!isBackgroundLoading && !username) {
      router.push('/');
    }
  }, [isBackgroundLoading, username, router]);

  // Show a loading skeleton while we're waiting for user/background data
  if (isBackgroundLoading || !username) {
    return <Skeleton className="h-screen w-screen bg-transparent" />;
  }

  return (
    <>
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Background Error</AlertTitle>
            <AlertDescription>
              Could not load backgrounds from the worker: {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Header />

      {/* Main Layout - Flexbox for precise geometric centering */}
      <main className="relative z-1 h-screen w-full flex overflow-hidden pt-[72px]">

        {/* Left Column - Community Panel */}
        {/* Fixed width, with padding to separate from header and elongate downwards */}
        <div className="hidden md:flex w-72 flex-col pl-4 pb-4 pt-6 h-full shrink-0">
          <div className="w-full h-full">
            {/* Inner container takes full height of this column */}
            <ErrorBoundary name="Presence Panel">
              <PresencePanel users={communityUsers} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Center Column - Welcome & Status */}
        {/* Flex-1 takes remaining space, geometric center */}
        <div className="flex-1 flex flex-col items-center justify-center relative pb-32">
          <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl px-4">
            <ErrorBoundary name="Welcome Panel">
              <WelcomePanel />
            </ErrorBoundary>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <ErrorBoundary name="Status Panel">
                <StatusPanel />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Right Column - Exam Timers */}
        <div className="hidden md:flex w-72 flex-col pr-4 pb-4 pt-6 h-full shrink-0 gap-3">
          <ExamCountdown title="JEE Mains (Session 1)" targetDate={jeeTargetDate} />
          <ExamCountdown title="JEE Mains (Session 2)" targetDate={jeeSession2TargetDate} />
          <ExamCountdown title="NEET UG" targetDate={neetTargetDate} />
        </div>

      </main>

      <VersionInfo />
    </>
  );
}