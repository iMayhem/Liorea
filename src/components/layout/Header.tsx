"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-10 p-4",
      isHomePage ? 'bg-transparent' : 'bg-background/80 backdrop-blur-sm border-b'
    )}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className={cn(
          "text-2xl font-bold tracking-tight",
          isHomePage ? 'text-white' : 'text-foreground'
        )}>
          Zenith Hub
        </Link>
        <nav>
          <Link href="/study-together" className={cn(
            "flex items-center gap-2 py-2 px-4 rounded-full transition-colors",
            isHomePage ? 'text-white/80 hover:text-white bg-black/20 backdrop-blur-sm' : 'text-foreground hover:bg-accent/80'
          )}>
            <Sparkles className="w-5 h-5 text-accent" />
            Study Together
          </Link>
        </nav>
      </div>
    </header>
  );
}
