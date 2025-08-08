// src/components/header.tsx
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut, Timer, Users, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStudyRoom } from "@/hooks/use-study-room";

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
            {user && (
              <>
                <Button asChild variant="outline" size="sm">
                    <Link href="/leaderboard">
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                    </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                    <Link href="/study-together">
                        <Users className="mr-2 h-4 w-4" />
                        Study Together
                    </Link>
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
           )}
        </div>
      </div>
    </header>
  );
}
