"use client";

import { GlassCard } from '@/features/ui/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserX, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePresence } from '@/context/PresenceContext';

export default function UserManagement() {
    const { communityUsers } = usePresence();

    return (
        <GlassCard className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="font-semibold">User Management</h3>
                <p className="text-xs text-white/50">Manage active members</p>
            </div>
            
            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/60">User</TableHead>
                            <TableHead className="text-white/60">Status</TableHead>
                            <TableHead className="text-right text-white/60">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {communityUsers.slice(0, 5).map((user) => (
                            <TableRow key={user.username} className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${user.status === 'Online' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>
                                        {user.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-6 w-6 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10 text-white">
                                            <DropdownMenuItem className="focus:bg-white/10">
                                                <Send className="mr-2 h-4 w-4" /> Message
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                                                <UserX className="mr-2 h-4 w-4" /> Kick
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </GlassCard>
    );
}