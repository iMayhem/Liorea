"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminUser = {
    username: string;
    xp: number;
    coins: number;
    level: number;
    email?: string;
    session_mic_seconds?: number;
};

export default function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { toast } = useToast();

    const handleBanUser = async (username: string) => {
        if (!confirm(`Are you sure you want to ban ${username}?`)) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/admin/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, banned: true })
            });
            toast({ title: "User banned" });
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Failed to ban user" });
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await api.study.getLeaderboard();
            // Cast to AdminUser for now (assuming API returns these fields)
            setUsers(data as any[]);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Failed to load users" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

    return (
        <Card className="bg-[#1e1f22]/50 border-zinc-800">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>User Directory</CardTitle>
                        <CardDescription>Manage user accounts and permissions.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={loadUsers} variant="outline" size="sm" className="gap-2">
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-6">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <Input
                        placeholder="Search by username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-black/20 border-zinc-700 focus:border-indigo-500"
                    />
                </div>

                <div className="rounded-md border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-black/20">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-[100px]">Avatar</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>Mic Time</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.username} className="border-zinc-800 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">
                                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-white">{user.username}</TableCell>
                                        <TableCell className="text-zinc-400 text-xs">Recently</TableCell>
                                        <TableCell className="text-zinc-300">
                                            {user.session_mic_seconds ? Math.round(user.session_mic_seconds / 60) : 0} m
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleBanUser(user.username)}
                                                    className="hover:bg-red-500/20 hover:text-red-500"
                                                >
                                                    <Gavel className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}