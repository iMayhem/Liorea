"use client";

import LioreaClient from "@/components/LioreaClient";
import AuthForm from "@/components/auth/AuthForm";
import { usePresence } from "@/context/PresenceContext";
import { useBackground } from "@/context/BackgroundContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { username, setUsername } = usePresence();
  const { isLoading: isBackgroundLoading } = useBackground();

  if (isBackgroundLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (!username) {
    return <AuthForm onLogin={setUsername} />;
  }

  return <LioreaClient />;
}
