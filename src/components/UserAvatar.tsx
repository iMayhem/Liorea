"use client";

import { usePresence } from "@/context/PresenceContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  fallbackUrl?: string; // Optional: If we have an image in a chat object, we can pass it as backup
  className?: string;
}

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

export default function UserAvatar({ username, fallbackUrl, className }: UserAvatarProps) {
  const { getUserImage } = usePresence();
  
  // 1. Try to get the "Live" image from our centralized map
  const liveImage = getUserImage(username);
  
  // 2. Decide which image to show
  const displayImage = liveImage || fallbackUrl;

  // 3. Generate consistent color based on username
  const charCodeSum = username ? username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  const colorClass = USER_COLORS[charCodeSum % USER_COLORS.length];

  return (
    <Avatar className={cn("border border-white/10", className)}>
      {displayImage && <AvatarImage src={displayImage} alt={username} />}
      <AvatarFallback className={cn("text-white font-medium", colorClass)}>
        {username ? username.charAt(0).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  );
}