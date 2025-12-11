"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { GlassCard } from '@/features/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scrollable } from '@/features/ui/Scrollable';
import { Users, Timer, Activity, Send, Loader2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';

// Separate Components for Cleanliness
import UserManagement from '@/components/admin/UserManagement'; 
import JournalManagement from '@/components/admin/JournalManagement';
import BackgroundManagement from '@/components/admin/BackgroundManagement';

// --- STATS WIDGET ---
function AdminStats() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-white/50 text-sm">
                <span>Total Users</span>
                <Users className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-green-400">+2 today</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-white/50 text-sm">
                <span>Avg Study Time</span>
                <Timer className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold">2h 37m</div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-white/50 text-sm">
                <span>Live Sessions</span>
                <Activity className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-white/40">Active now</p>
        </GlassCard>
    </div>
  )
}

// --- NOTIFICATION WIDGET ---
function GlobalNotificationSender() {
    const [msg, setMsg] = useState('');
    const [sending, setSending] = useState(false);
    const { addNotification } = useNotifications();
    const { toast } = useToast();

    const handleSend = async () => {
        if(!msg.trim()) return;
        setSending(true);
        try {
            await addNotification(msg);
            toast({ title: "Sent", description: "Broadcasted to all users." });
            setMsg("");
        } catch(e) {
            toast({ variant: "destructive", title: "Failed" });
        } finally {
            setSending(false);
        }
    }

    return (
        <GlassCard className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-accent" /> Global Broadcast
            </h3>
            <Textarea 
                placeholder="Type message..." 
                value={msg}
                onChange={e => setMsg(e.target.value)}
                className="bg-white/5 border-white/10 resize-none min-h-[100px]"
            />
            <div className="flex justify-end">
                <Button onClick={handleSend} disabled={sending || !msg}>
                    {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send
                </Button>
            </div>
        </GlassCard>
    )
}

export default function AdminPage() {
  return (
    <div className="h-screen flex flex-col text-white">
      <Header />
      
      {/* Replaced generic div with Scrollable */}
      <Scrollable className="flex-1 pt-24 pb-12 px-4">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          
          <AdminStats />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <GlobalNotificationSender />
             <UserManagement />
          </div>

          <JournalManagement />
          <BackgroundManagement />

        </div>
      </Scrollable>
    </div>
  );
}