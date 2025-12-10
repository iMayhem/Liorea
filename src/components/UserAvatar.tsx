"use client";

import { usePresence } from "@/context/PresenceContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUserContextMenu } from "@/context/UserContextMenuContext";

interface UserAvatarProps {
  username: string;
  fallbackUrl?: string; 
  className?: string;
}

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

export default function UserAvatar({ username, fallbackUrl, className }: UserAvatarProps) {
  const { getUserImage } = usePresence();
  const { openMenu } = useUserContextMenu();
  
  const liveImage = getUserImage(username);
  const displayImage = liveImage || fallbackUrl;

  const charCodeSum = username ? username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  const colorClass = USER_COLORS[charCodeSum % USER_COLORS.length];

  const handleContextMenu = (e: React.MouseEvent) => {
      if (username) {
          openMenu(e, username);
      }
  };

  return (
    <Avatar 
        className={cn("border border-white/10 cursor-pointer", className)}
        onContextMenu={handleContextMenu}
    >
      {displayImage && <AvatarImage src={displayImage} alt={username} />}
      <AvatarFallback className={cn("text-white font-medium", colorClass)}>
        {username ? username.charAt(0).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  );
}