"use client";

import LioreaClient from "@/components/LioreaClient";
import AuthForm from "@/components/auth/AuthForm";
import { usePresence } from "@/context/PresenceContext";
import { useBackground } from "@/context/BackgroundContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { username, setUsername } = usePresence();
  const { isLoading: isBackgroundLoading } = useBackground();
  const router = useRouter();

  useEffect(() => {
    if (!isBackgroundLoading && !username) {
        router.push('/');
    }
  }, [isBackgroundLoading, username, router]);


  if (isBackgroundLoading || !username) {
    return <Skeleton className="h-screen w-screen bg-transparent" />;
  }

  return <LioreaClient />;
}
