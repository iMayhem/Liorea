"use client";

import { useState, useEffect } from "react";
import { usePresence } from "@/context/PresenceContext";
import { Input } from "@/components/ui/input";
import { Smile } from "lucide-react";
import { GlassCard } from "@/features/ui/GlassCard";
import { api } from "@/lib/api";

export default function StatusInput() {
  const { username, updateStatusMessage, communityUsers } = usePresence();
  
  // Find my current status locally
  const myUser = communityUsers.find(u => u.username === username);
  const currentStatus = myUser?.status_text || "";

  const [isEditing, setIsEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    setTempStatus(currentStatus);
  }, [currentStatus]);

  const saveStatus = async () => {
    // 1. Context Update (Fast/Optimistic)
    await updateStatusMessage(tempStatus);
    
    // 2. API Backup (Persistent)
    if(username) api.auth.updateStatus(username, tempStatus);
    
    setIsEditing(false);
  };

  return (
     <GlassCard variant="ghost" className="w-full max-w-sm mx-auto transition-all hover:bg-white/10">
         {isEditing ? (
            <div className="flex items-center gap-2">
                <Smile className="text-white/50 w-4 h-4" />
                <Input 
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveStatus()}
                  onBlur={saveStatus}
                  autoFocus
                  className="h-6 bg-transparent border-none p-0 text-sm focus-visible:ring-0"
                  placeholder="What's your focus?"
                />
            </div>
        ) : (
            <div 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-3 cursor-pointer select-none"
            >
                <div className="p-1.5 rounded-full bg-white/10 text-white/80">
                    <Smile className="w-4 h-4" />
                </div>
                <span className={`text-sm italic truncate ${currentStatus ? 'text-white/90' : 'text-white/40'}`}>
                    {currentStatus || "Set a status..."}
                </span>
            </div>
        )}
     </GlassCard>
  );
}