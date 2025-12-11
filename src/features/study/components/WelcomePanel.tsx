"use client";

import { usePresence } from "../context/PresenceContext";

export default function WelcomePanel() {
  const { username } = usePresence();

  return (
    <div className="w-full text-center flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-center">
          Welcome, <br className="md:hidden" />
          {username}!
        </h1>
      </div>
    </div>
  );
}