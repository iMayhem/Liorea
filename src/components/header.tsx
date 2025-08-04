// src/components/header.tsx
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut, Timer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <AppLogo />
            <span className="font-bold">Neet Tracker</span>
          </Link>
        </div>
        {user && <p className="text-sm text-muted-foreground">Signed in as {user.username}</p>}
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
           </Button>
            <Button asChild variant="secondary" size="sm">
                <Link href="/study">
                    <Timer className="mr-2 h-4 w-4" />
                    Study Space
                </Link>
            </Button>
           {user && (
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
           )}
        </div>
      </div>
    </header>
  );
}
