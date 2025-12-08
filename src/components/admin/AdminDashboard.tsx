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


export default function AdminDashboard() {
  const [notificationMessage, setNotificationMessage] = useState('');
  const { toast } = useToast();
  const { addNotification } = useNotifications();

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

  return (
    <div className="w-full space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">
                        +2 since last hour
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Average Study Time
                    </CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">2h 37m</div>
                    <p className="text-xs text-muted-foreground">
                        based on today's sessions
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Sessions
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">
                        users currently online
                    </p>
                </CardContent>
            </Card>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Global Notifications</CardTitle>
                <CardDescription>Send a message to all active users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Type your notification message here..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="bg-background/50"
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSendGlobalNotification}>
                    <Send className="mr-2 h-4 w-4" />
                    Send to All
                </Button>
            </CardFooter>
        </Card>
        <BackgroundManagement />
        <UserManagement />
    </div>
  );
}
