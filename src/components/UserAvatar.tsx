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

const USER_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
];

export default function UserAvatar({ username, fallbackUrl, className, showStatus = false, decorationUrl, maskClass }: UserAvatarProps) {
  const { getUserImage, getUserFrame, studyUsers } = usePresence();
  const { openMenu } = useUserContextMenu();
  // Safe access to gamification context (optional incase used outside provider, though unlikely)
  let getItem: ((id: string) => any) | undefined;
  try {
    const g = useGamification();
    getItem = g.getItem;
  } catch (e) { }

  const liveImage = getUserImage(username);
  const displayImage = liveImage || fallbackUrl;

  // Resolve Frame
  const frameId = getUserFrame ? getUserFrame(username) : null;
  const frameItem = (frameId && getItem) ? getItem(frameId) : null;

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
      {/* Decoration / Effect (Legacy prop) */}
      {decorationUrl && (
        <img
          src={decorationUrl}
          className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] z-20 pointer-events-none"
          alt=""
        />
      )}

      {/* Global Frame Overlay */}
      {frameItem && frameItem.assetUrl && (
        <div className="absolute -top-[30%] -left-[30%] w-[180%] h-[180%] z-20 pointer-events-none select-none">
          <LottiePreview
            url={getProxiedUrl(frameItem.assetUrl)}
            className="w-full h-full"
            imageFallback={true}
            loop={true}
            autoplay={true}
          />
        </div>
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