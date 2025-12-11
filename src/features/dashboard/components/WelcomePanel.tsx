"use client";

import { usePresence } from "@/shared/context/PresenceContext";

export default function WelcomePanel() {
  const { username } = usePresence();
  
  return (
    <div className="w-full text-center">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Welcome, {username}!
        </h1>
      </div>
    </div>
  );
}