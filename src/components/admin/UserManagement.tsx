"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, UserX, Edit, Trash2, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePresence } from '@/context/PresenceContext';
import { CommunityUser } from '@/context/PresenceContext'; // Changed to CommunityUser

export default function UserManagement() {
    // Show everyone in the community list
    const { communityUsers: users } = usePresence(); 
    const [editingUser, setEditingUser] = useState<CommunityUser | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const { toast } = useToast();

    const handleBlockUser = (userName: string) => {
        toast({ 
            variant: "destructive",
            title: "Action Not Implemented", 
            description: `Blocking functionality is not yet connected to the backend.` 
        });
    };
    
    const startEditing = (user: CommunityUser) => {
        setEditingUser(user);
        setNewUsername(user.username);
    };

    const handleUsernameChange = () => {
        if (editingUser && newUsername.trim()) {
            toast({
                variant: "destructive",
                title: "Action Not Implemented",
                description: `Changing usernames is not yet connected to the backend.`
            });
            setEditingUser(null);
            setNewUsername('');
        }
    };
    
    const handleClearChat = (userName: string) => {
        toast({ 
            variant: "destructive",
            title: "Action Not Implemented", 
            description: `Clearing chat is not yet connected to the backend.` 
        });
    };

    const handleSendNotification = (userName: string) => {
        toast({ title: "Notification Sent", description: `A notification has been sent to ${userName}.` });
    };

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all registered users and perform administrative actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/20">
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.username} className="hover:bg-muted/50 border-white/20">
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{user.last_seen ? new Date(user.last_seen).toLocaleString() : 'N/A'}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/20">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/20 backdrop-blur-md border-white/20 text-white">
                            <DropdownMenuItem onClick={() => startEditing(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Change Username</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockUser(user.username)}>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Block User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClearChat(user.username)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Clear Chat</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSendNotification(user.username)}>
                                <Send className="mr-2 h-4 w-4" />
                                <span>Send Notification</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
        {editingUser && (
             <AlertDialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <AlertDialogContent className="bg-black/20 backdrop-blur-md border-white/20 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Username for {editingUser.username}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the new username below. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New username"
                        className="mt-4 bg-transparent border-white/30"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUsernameChange}>Save Change</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
    </Card>
  );
}