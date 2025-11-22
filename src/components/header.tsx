'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft, LogOut, Users, Home, ShieldQuestion, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader = React.memo(function AppHeader() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => router.back();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
            <div className="mr-4 flex items-center">
              {isHomePage && (
                <Link href="/" className="flex items-center space-x-2">
                  <AppLogo />
                  <span className="font-bold hidden sm:block">Liorea</span>
                </Link>
              )}
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
               {!isHomePage && <Button onClick={handleBack} variant="ghost" size="sm" className="hidden md:inline-flex"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>}
               <Button asChild variant="ghost" size="sm"><Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link></Button>
                {user && (
                  <>
                    <Button asChild variant="ghost" size="sm"><Link href="/study-together"><Users className="mr-2 h-4 w-4" /> Study</Link></Button>
                    <Button asChild variant="ghost" size="sm"><Link href="/jamnight"><Music className="mr-2 h-4 w-4" /> JamNight</Link></Button>
                    <Button asChild variant="ghost" size="sm"><Link href="/ask-mod"><ShieldQuestion className="mr-2 h-4 w-4" /> Help</Link></Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.photoURL || ''} alt={profile?.username || 'User'}/>
                            <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>{profile?.username}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
               )}
            </div>
      </div>
    </header>
  );
});

export { AppHeader };