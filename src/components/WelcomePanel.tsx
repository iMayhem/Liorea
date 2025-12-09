"use client";

import { useState, useEffect } from "react";
import { usePresence } from "@/context/PresenceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

export default function WelcomePanel() {
  const { username, renameUser } = usePresence();
  
  // State for renaming
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (username) setTempName(username);
  }, [username]);

  const handleNameSave = async () => {
    if (tempName && tempName !== username) {
      const success = await renameUser(tempName);
      if (success) setIsEditingName(false);
    } else {
      setIsEditingName(false);
    }
  };

  return (
    <div className="w-full text-center">
      {isEditingName ? (
        <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/20 animate-in fade-in zoom-in">
          <Input 
            value={tempName} 
            onChange={(e) => setTempName(e.target.value)} 
            className="text-3xl font-bold h-12 w-auto bg-transparent border-none focus-visible:ring-0 text-white"
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={handleNameSave} className="hover:bg-green-500/20 text-green-400">
            <Check className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} className="hover:bg-red-500/20 text-red-400">
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="group flex items-center justify-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome, {username}!
          </h1>
          <button 
            onClick={() => setIsEditingName(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      )}
      <p className="mt-2 text-white/70 text-lg">Your cozy corner to study & connect.</p>
    </div>
  );
}
