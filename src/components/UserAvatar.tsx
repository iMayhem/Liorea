"use client";

import { usePresence } from "@/features/study";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUserContextMenu } from "@/context/UserContextMenuContext";

interface UserAvatarProps {
  username: string;
  fallbackUrl?: string;
  className?: string;
  showStatus?: boolean;
  decorationUrl?: string | null;
  maskClass?: string;
}

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

export default function UserAvatar({ username, fallbackUrl, className, showStatus = false, decorationUrl }: UserAvatarProps) {
  const { getUserImage, studyUsers } = usePresence(); // Using studyUsers to check online status if needed
  const { openMenu } = useUserContextMenu();

  const liveImage = getUserImage(username);
  const displayImage = liveImage || fallbackUrl;

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
      {/* Decoration / Frame (APNG) */}
      {decorationUrl && (
        <img
          src={decorationUrl}
          className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] z-20 pointer-events-none"
          alt=""
        />
      )}

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

      {/* Status Indicator (Only if requested and user is online, for now) */}
      {showStatus && isOnline && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#18181b] z-10" />
      )}
    </div>
  );
}