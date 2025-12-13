"use client";

import { useEffect, useRef } from 'react';
import { useUserContextMenu } from '@/context/UserContextMenuContext';
import { Card } from '@/components/ui/card';
import { User, Ban, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePresence } from '@/features/study'; // Import to identify who is reporting
import { db } from '@/lib/firebase'; // Import existing Firebase DB instance
import { ref, push, serverTimestamp } from 'firebase/database'; // Firebase functions


export default function GlobalUserContextMenu() {
  const { isOpen, position, targetUser, closeMenu } = useUserContextMenu();
  const { username: myUsername } = usePresence();
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  if (!isOpen || !targetUser) return null;

  // ... handleReport ...
  const handleReport = async () => { /* ... existing report logic ... */ };

  const handleAction = (action: string) => {
    toast({ title: `${action}`, description: `Action performed on ${targetUser}` });
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-48 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
    >
      <Card className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-1.5 shadow-2xl text-zinc-200 overflow-hidden rounded-xl w-52 ring-1 ring-white/5">
        <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 select-none">
          @{targetUser}
        </div>



        <button
          onClick={() => handleAction('Block User')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
        >
          <Ban className="w-4 h-4" />
          Block User
        </button>

        <button
          onClick={handleReport}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
        >
          <XCircle className="w-4 h-4" />
          Report Abuse
        </button>
      </Card>
    </div>
  );
}