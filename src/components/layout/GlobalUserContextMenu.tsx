"use client";

import { useEffect, useRef } from 'react';
import { useUserContextMenu } from '@/context/UserContextMenuContext';
import { Card } from '@/components/ui/card';
import { User, Ban, MessageSquare, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GlobalUserContextMenu() {
  const { isOpen, position, targetUser, closeMenu } = useUserContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (isOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, closeMenu]);

  if (!isOpen || !targetUser) return null;

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
        <Card className="bg-[#18181b]/95 backdrop-blur-xl border border-white/10 p-1 shadow-2xl text-white">
            <div className="px-2 py-1.5 text-xs font-semibold text-white/50 border-b border-white/5 mb-1">
                @{targetUser}
            </div>
            <button onClick={() => handleAction('View Profile')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-white/10 transition-colors text-left">
                <User className="w-4 h-4" /> View Profile
            </button>
            <button onClick={() => handleAction('Message')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-white/10 transition-colors text-left">
                <MessageSquare className="w-4 h-4" /> Message
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button onClick={() => handleAction('Block User')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-left">
                <Ban className="w-4 h-4" /> Block
            </button>
             <button onClick={() => handleAction('Report')} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-left">
                <XCircle className="w-4 h-4" /> Report
            </button>
        </Card>
    </div>
  );
}