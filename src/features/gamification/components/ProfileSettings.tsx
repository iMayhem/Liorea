import React, { useState, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { useGamification } from '@/features/gamification/context/GamificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, LogOut, Save, User as UserIcon, Sparkles, Palette } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ShopItem } from '../types';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface ProfileSettingsProps {
    allItems: ShopItem[];
    onClose: () => void;
}

export function ProfileSettings({ allItems, onClose }: ProfileSettingsProps) {
    const { username, setUsername, userImage, setUserImage } = usePresence();
    const { stats, equipItem, refreshStats } = useGamification();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form States
    const [newName, setNewName] = useState(username || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived Lists - Items user owns OR are free (price 0)
    // We treat 'inventory' as list of IDs.
    const hasItem = (id: string) => stats.inventory.includes(id) || allItems.find(i => i.id === id)?.price === 0;

    const myBadges = allItems.filter(i => i.type === 'badge' && hasItem(i.id));
    const myFrames = allItems.filter(i => i.type === 'frame' && hasItem(i.id));
    const myEffects = allItems.filter(i => i.type === 'effect' && hasItem(i.id));
    const myColors = allItems.filter(i => i.type === 'color' && hasItem(i.id));

    const handleRename = async () => {
        if (!newName || newName === username) return;
        setLoading(true);
        try {
            await api.auth.renameUser(username!, newName);
            // Updating local context
            setUsername(newName);
            toast({ title: "Name Updated", description: `You are now known as ${newName}` });
            // Close or refresh?
            onClose();
        } catch (e: any) {
            toast({ variant: "destructive", title: "Rename Failed", description: e.message || "Could not rename user." });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const { url } = await api.upload.put(file);
            setUserImage(url);
            toast({ title: "Avatar Updated" });
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Upload Failed" });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.clear();
            window.location.reload();
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-zinc-950 text-zinc-100 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    Profile Settings
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800 rounded-full">
                    <LogOut className="w-4 h-4 text-red-400" />
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-zinc-900 rounded-lg p-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-zinc-800">General</TabsTrigger>
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-zinc-800">Cosmetics</TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-zinc-800">Account</TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* AVATAR */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 overflow-hidden border-2 border-zinc-700 relative group">
                            {userImage ? (
                                <img
                                    src={userImage}
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                                    alt="avatar"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 group-hover:opacity-50 transition-opacity">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-zinc-400">Profile Picture</Label>
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                                Upload Image
                            </Button>
                            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
                            <p className="text-xs text-zinc-500">Square images work best.</p>
                        </div>
                    </div>

                    {/* NAME */}
                    <div className="space-y-3">
                        <Label>Display Name</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Username"
                                className="bg-zinc-900 border-zinc-700"
                            />
                            <Button onClick={handleRename} disabled={loading || newName === username}>
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* COSMETICS TAB */}
                <TabsContent value="appearance" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* BADGE */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Equipped Badge</Label>
                        <Select onValueChange={v => equipItem(v, 'badge')} value={stats.equipped_badge || "none"}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                                <SelectItem value="none">None</SelectItem>
                                {myBadges.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* FRAME */}
                    <div className="space-y-2">
                        <Label>Avatar Frame</Label>
                        <Select onValueChange={v => equipItem(v, 'frame')} value={stats.equipped_frame || "none"}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                                <SelectItem value="none">None</SelectItem>
                                {myFrames.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* EFFECT */}
                    <div className="space-y-2">
                        <Label>Profile Effect</Label>
                        <Select onValueChange={v => equipItem(v, 'effect')} value={stats.equipped_effect || "none"}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                                <SelectItem value="none">None</SelectItem>
                                {myEffects.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* NAME COLOR */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Palette className="w-4 h-4 text-purple-400" /> Name Color</Label>
                        <Select onValueChange={v => equipItem(v, 'color')} value={stats.name_color || "none"}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                                <SelectItem value="none">Default</SelectItem>
                                {myColors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>

                {/* ACCOUNT TAB */}
                <TabsContent value="account" className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
                        <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
                        <p className="text-xs text-red-300/70 mb-4">Once you sign out, you will need to log in again to access your account.</p>
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out from Liorea
                        </Button>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
