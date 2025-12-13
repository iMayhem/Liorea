"use client";

import { usePresence } from "@/features/study";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUserContextMenu } from "@/context/UserContextMenuContext";
import { useGamification } from "@/features/gamification/context/GamificationContext";
import { getProxiedUrl } from "@/lib/api";
import dynamic from "next/dynamic";

const LottiePreview = dynamic(() => import('@/components/ui/LottiePreview').then(mod => mod.LottiePreview), {
  ssr: false,
  loading: () => null
});

interface UserAvatarProps {
  username: string;
  fallbackUrl?: string;
  className?: string;
  showStatus?: boolean;
  decorationUrl?: string | null;
  maskClass?: string;
}

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { usePresence } from '@/features/study/context/PresenceContext';

interface UserAvatarProps {
  username: string;
  className?: string;
  fallbackUrl?: string;
}

export default function UserAvatar({ username, className, fallbackUrl }: UserAvatarProps) {
  const { getUserImage } = usePresence();

  // 1. Try prop fallback
  // 2. Try global presence lookups
  const image = fallbackUrl || getUserImage(username);

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn("w-full h-full border-2 border-border/50 shadow-sm", className)}>
        <AvatarImage src={image} className="object-cover" />
        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
          {username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

<Avatar
  className={cn(
    "border border-white/10 cursor-pointer transition-opacity hover:opacity-90",
    showStatus && isOnline ? (maskClass || "discord-mask") : "",
    className
  )}
  onContextMenu={handleContextMenu}
>
  {displayImage && <AvatarImage src={displayImage} alt={username} />}
  <AvatarFallback className={cn("text-white font-medium", colorClass)}>
    {username ? username.charAt(0).toUpperCase() : '?'}
  </AvatarFallback>
</Avatar>

{/* Status Indicator (Only if requested and user is online, for now) */ }
{
  showStatus && isOnline && (
    <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#18181b] z-10" />
  )
}
    </div >
  );
}