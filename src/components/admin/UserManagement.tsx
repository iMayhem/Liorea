"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers as initialUsers, User } from '@/lib/mock-data';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const { toast } = useToast();

    const handleRoleChange = (userId: number, role: 'user' | 'mod' | 'helper') => {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
        toast({ title: "Role Updated", description: `User role has been changed to ${role}.` });
    };

    const handleBlockUser = (userId: number) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
        const user = users.find(u => u.id === userId);
        toast({ title: user?.isBlocked ? "User Unblocked" : "User Blocked", description: `${user?.name} has been ${user?.isBlocked ? 'unblocked' : 'blocked'}.` });
    };
    
    const startEditing = (user: User) => {
        setEditingUser(user);
        setNewUsername(user.name);
    };

    const handleUsernameChange = () => {
        if (editingUser && newUsername.trim()) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: newUsername.trim() } : u));
            toast({ title: "Username Changed", description: `Username updated to ${newUsername.trim()}.` });
            setEditingUser(null);
            setNewUsername('');
        }
    };
    
    const handleClearChat = (userName: string) => {
        toast({ title: "Chat Cleared", description: `Chat logs for ${userName} have been cleared.` });
    };

    const handleSendNotification = (userName: string) => {
        toast({ title: "Notification Sent", description: `A notification has been sent to ${userName}.` });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles, block users, and perform other administrative actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'mod' | 'helper')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="mod">Moderator</SelectItem>
                      <SelectItem value="helper">Helper</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.isBlocked ? 'Blocked' : 'Active'}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Change Username</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockUser(user.id)}>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>{user.isBlocked ? 'Unblock' : 'Block'} User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClearChat(user.name)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Clear Chat</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSendNotification(user.name)}>
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Username for {editingUser.name}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the new username below. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New username"
                        className="mt-4"
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
