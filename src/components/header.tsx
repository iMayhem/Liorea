// src/components/header.tsx
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut, Timer, Users, Trophy, Palette, Sun, Moon, Home, RefreshCw, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStudyRoom } from "@/hooks/use-study-room";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useBackground } from "@/hooks/use-background";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { changeBackground, isChanging } = useBackground();

  const handleBack = () => {
    router.back();
  };
  
  const isHomePage = ['/neet-achiever-home', '/neet-home', '/jee-home', '/'].includes(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          {isHomePage && (
            <Link href="/" className="flex items-center space-x-2">
              <AppLogo />
              <span className="font-bold">Study Tracker</span>
            </Link>
          )}
        </div>
        {user && <p className="text-sm text-muted-foreground">Signed in as {user.username}</p>}
        <div className="flex flex-1 items-center justify-end space-x-2">
           {!isHomePage && (
             <Button onClick={handleBack} variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
             </Button>
           )}
           <Button asChild variant="outline" size="sm">
              <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
              </Link>
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
                <Button variant="ghost" size="icon" onClick={changeBackground} disabled={isChanging}>
                    {isChanging ? <RefreshCw className="h-[1.2rem] w-[1.2rem] animate-spin" /> : <ImageIcon className="h-[1.2rem] w-[1.2rem]" />}
                    <span className="sr-only">Change Background</span>
                </Button>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Palette className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Glassmorphic
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("theme-blue")}>
                      Classic Blue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("theme-zinc")}>
                      Dark Glass
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
