"use client";

import LioreaClient from "@/components/LioreaClient";
import AuthForm from "@/components/auth/AuthForm";
import { usePresence } from "@/context/PresenceContext";

export default function Home() {
  const { username, setUsername } = usePresence();

  if (!username) {
    return <AuthForm onLogin={setUsername} />;
  }

  return <LioreaClient />;
}
