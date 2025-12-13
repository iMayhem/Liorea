"use client";

import { useState, useEffect } from "react";
import { usePresence } from "../context/PresenceContext";
import { Input } from "@/components/ui/input";
import { Smile } from "lucide-react";
import { BentoCard, CardContent } from "@/components/ui/BentoCard";

export default function StatusPanel() {
  const { username, updateStatusMessage, communityUsers } = usePresence();

  const myUser = communityUsers.find(u => u.username === username);
  const currentStatus = myUser?.status_text || "";

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    setTempStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusSave = async () => {
    await updateStatusMessage(tempStatus);
    setIsEditingStatus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleStatusSave();
    }
  };

  return (
    <BentoCard className="w-full max-w-sm mx-auto shadow-lg bg-card border-none" noPadding>
      <CardContent className="p-3">
        {isEditingStatus ? (
          <div className="flex items-center gap-2 w-full">
            <Smile className="text-muted-foreground w-5 h-5 flex-shrink-0" />
            <Input
              placeholder="How are you feeling?"
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-muted border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-8 text-sm"
              autoFocus
              onBlur={handleStatusSave}
            />
          </div>
        ) : (
          <div
            onClick={() => setIsEditingStatus(true)}
            className="flex items-center gap-3 w-full cursor-pointer group p-1 hover:bg-accent rounded transition-colors"
          >
            <div className="p-1 rounded-full bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
              <Smile className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium truncate ${currentStatus ? 'text-foreground' : 'text-muted-foreground'}`}>
              {currentStatus || "Set a status..."}
            </span>
          </div>
        )}
      </CardContent>
    </BentoCard>
  );
}