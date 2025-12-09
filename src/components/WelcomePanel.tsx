"use client";

import { useState, useEffect } from "react";
import { usePresence } from "@/context/PresenceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Smile } from "lucide-react";

export default function WelcomePanel() {
  const { username, renameUser, updateStatusMessage, onlineUsers } = usePresence();
  
  // Find my own user data to get the current status
  const myUser = onlineUsers.find(u => u.username === username);
  const currentStatus = myUser?.status_text || "";

  // State for renaming
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // State for status
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    if (username) setTempName(username);
  }, [username]);

  useEffect(() => {
    setTempStatus(currentStatus);
  }, [currentStatus]);

  const handleNameSave = async () => {
    if (tempName && tempName !== username) {
      const success = await renameUser(tempName);
      if (success) setIsEditingName(false);
    } else {
      setIsEditingName(false);
    }
  };

  const handleStatusSave = async () => {
    await updateStatusMessage(tempStatus);
    setIsEditingStatus(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 space-y-4">
      {/* 1. Name Section */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/20 animate-in fade-in zoom-in">
            <Input 
              value={tempName} 
              onChange={(e) => setTempName(e.target.value)} 
              className="text-2xl font-bold h-10 w-64 bg-transparent border-none focus-visible:ring-0 text-white"
            />
            <Button size="icon" variant="ghost" onClick={handleNameSave} className="hover:bg-green-500/20 text-green-400">
              <Check className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} className="hover:bg-red-500/20 text-red-400">
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="group flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
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
      </div>

      {/* 2. Status Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-md border border-white/10 p-1">
        <div className="bg-black/20 rounded-lg p-4 flex items-center justify-between gap-4">
            
          {isEditingStatus ? (
             <div className="flex items-center gap-2 w-full">
                <Smile className="text-white/50 w-5 h-5" />
                <Input 
                  placeholder="How are you feeling today?"
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="bg-transparent border-none text-white/90 placeholder:text-white/40 focus-visible:ring-0 h-8"
                  autoFocus
                />
                <Button size="sm" onClick={handleStatusSave} className="bg-white/10 hover:bg-white/20 text-white h-8">
                    Set Status
                </Button>
             </div>
          ) : (
              <div 
                onClick={() => setIsEditingStatus(true)}
                className="flex items-center gap-3 w-full cursor-pointer group"
              >
                  <div className="p-2 rounded-full bg-white/5 text-white/80 group-hover:bg-white/10 transition-colors">
                    <Smile className="w-5 h-5" />
                  </div>
                  <span className={`text-lg italic ${currentStatus ? 'text-white/90' : 'text-white/40'}`}>
                    {currentStatus || "How are you feeling today?"}
                  </span>
                  <span className="text-xs text-white/30 ml-auto group-hover:text-white/60 transition-colors">
                    Click to update (24h)
                  </span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
