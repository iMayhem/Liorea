"use client";

import { useState, useEffect } from "react";
import { usePresence } from "@/context/PresenceContext";
import { Input } from "@/components/ui/input";
import { Smile } from "lucide-react";
import { Card, CardContent } from "../ui/card";

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
     <Card className="bg-black/10 backdrop-blur-md border border-white/30 text-white w-full max-w-sm mx-auto shadow-lg">
        <CardContent className="p-3">
             {isEditingStatus ? (
                <div className="flex items-center gap-2 w-full">
                    <Smile className="text-white/50 w-5 h-5 flex-shrink-0" />
                    <Input 
                    placeholder="How are you feeling?"
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none text-white/90 placeholder:text-white/40 focus-visible:ring-0 h-8 text-sm"
                    autoFocus
                    onBlur={handleStatusSave}
                    />
                </div>
            ) : (
                <div 
                    onClick={() => setIsEditingStatus(true)}
                    className="flex items-center gap-3 w-full cursor-pointer group p-1"
                >
                    <div className="p-1 rounded-full bg-white/5 text-white/80">
                        <Smile className="w-5 h-5" />
                    </div>
                    <span className={`text-sm italic truncate ${currentStatus ? 'text-white/90' : 'text-white/40'}`}>
                        {currentStatus || "Set a status..."}
                    </span>
                </div>
            )}
        </CardContent>
     </Card>
  );
}