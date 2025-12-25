"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { usePresence } from '@/features/study/context/PresenceContext';
import { useUserContextMenu } from "@/context/UserContextMenuContext";

interface UserAvatarProps {
  username: string;
  className?: string;
  fallbackUrl?: string;
  showStatus?: boolean;
  maskClass?: string;
}

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

const UserAvatar = React.memo(function UserAvatar({ username, className, fallbackUrl, showStatus = false, maskClass }: UserAvatarProps) {
  const { getUserImage, studyUsers } = usePresence();
  const { openMenu } = useUserContextMenu();

  // 1. Try prop fallback
  // 2. Try global presence lookups
  const image = fallbackUrl || getUserImage(username);

  const charCodeSum = username ? username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  const colorClass = USER_COLORS[charCodeSum % USER_COLORS.length];

  // Simple online check: is the user in the presence list?
  const isOnline = studyUsers.some(u => u.username === username);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (username) {
      openMenu(e, username);
    }
  };

  return (
    <div className="relative inline-block group">
      <Avatar
        className={cn(
          "border border-white/10 cursor-pointer transition-opacity hover:opacity-90",
          showStatus && isOnline ? (maskClass || "discord-mask") : "",
          className
        )}
        onContextMenu={handleContextMenu}
      >
        {image && <AvatarImage src={image} className="object-cover" alt={username} />}
        <AvatarFallback className={cn("text-white font-medium", colorClass)}>
          {username ? username.charAt(0).toUpperCase() : '?'}
        </AvatarFallback>
      </Avatar>

      {/* Status Indicator */}
      {showStatus && isOnline && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#18181b] z-10" />
      )}
    </div>
  );
});

export default UserAvatar;