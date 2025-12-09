"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, Timer, Activity, Send } from 'lucide-react';
import UserManagement from './UserManagement';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationContext';
import BackgroundManagement from './BackgroundManagement';
import { usePresence } from '@/context/PresenceContext';


export default function AdminDashboard() {
  const [notificationMessage, setNotificationMessage] = useState('');
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { onlineUsers } = usePresence();

  const handleSendGlobalNotification = () => {
    if (notificationMessage.trim()) {
      addNotification(notificationMessage.trim());
      toast({
        title: "Global Notification Sent",
        description: "Your message has been sent to all users.",
      });
      setNotificationMessage('');
    }
  };
  
  const totalUsers = onlineUsers.length;
  const activeSessions = onlineUsers.filter(u => u.status === 'Online').length;
  const totalStudySeconds = onlineUsers.reduce((acc, user) => acc + (user.total_study_time || 0), 0);
  const averageStudySeconds = totalUsers > 0 ? totalStudySeconds / totalUsers : 0;
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="w-full space-y-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        All registered users
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Average Study Time
                    </CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatTime(averageStudySeconds)}</div>
                    <p className="text-xs text-muted-foreground">
                        across all users
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Sessions
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeSessions}</div>
                    <p className="text-xs text-muted-foreground">
                        users currently online
                    </p>
                </CardContent>
            </Card>
        </div>
        <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
            <CardHeader>
                <CardTitle>Global Notifications</CardTitle>
                <CardDescription>Send a message to all active users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Type your notification message here..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="bg-transparent border-white/30"
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSendGlobalNotification}>
                    <Send className="mr-2 h-4 w-4" />
                    Send to All
                </Button>
            </CardFooter>
        </Card>
        <UserManagement />
        <BackgroundManagement />
    </div>
  );
}
