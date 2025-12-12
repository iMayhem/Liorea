import React, { useState, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { useGamification } from '@/features/gamification/context/GamificationContext';
import dynamic from 'next/dynamic';
import { getProxiedUrl } from '@/lib/api';

const LottiePreview = dynamic(() => import('@/components/ui/LottiePreview').then(mod => mod.LottiePreview), {
    ssr: false
});
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
import { useSettings } from '@/context/SettingsContext';
import { Monitor } from 'lucide-react';

interface ProfileSettingsProps {
    allItems: ShopItem[];
    onClose: () => void;
}

export function ProfileSettings({ allItems, onClose }: ProfileSettingsProps) {
    const { username, setUsername, userImage, setUserImage } = usePresence();
    const { stats, equipItem, refreshStats } = useGamification();
    const { toast } = useToast();
    const { textSize, setTextSize } = useSettings();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived Lists - Items user owns OR are free (price 0)
    // We treat 'inventory' as list of IDs.
    // Removed rename state and logic as per request.
    const hasItem = (id: string) => stats.inventory.includes(id) || allItems.find(i => i.id === id)?.price === 0;

    const myBadges = allItems.filter(i => i.type === 'badge' && hasItem(i.id));
    const myFrames = allItems.filter(i => i.type === 'frame' && hasItem(i.id));
    const myEffects = allItems.filter(i => i.type === 'effect' && hasItem(i.id));
    const myColors = allItems.filter(i => i.type === 'color' && hasItem(i.id));


    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const { url } = await api.upload.put(file);
            setUserImage(url); // Updates Context + Firebase RTDB

            // Persist to D1 (So other users/API see it)
            await api.auth.updateProfile(url);

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
        <div className="p-6 space-y-6 bg-discord-dark text-discord-text h-full overflow-y-auto w-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    Profile Settings
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-discord-gray rounded-full">
                    <LogOut className="w-4 h-4 text-red-400" />
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-discord-gray rounded-lg p-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-discord-light">General</TabsTrigger>
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-discord-light">Cosmetics</TabsTrigger>
                    <TabsTrigger value="ui" className="data-[state=active]:bg-discord-light">Appearance</TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-discord-light">Account</TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* AVATAR */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 min-w-[6rem] min-h-[6rem] shrink-0 rounded-full bg-discord-gray overflow-hidden border-2 border-discord-light relative group shadow-lg">
                            {userImage ? (
                                <img
                                    src={userImage}
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                                    alt="avatar"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-discord-light text-discord-text-muted group-hover:opacity-50 transition-opacity">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                            )}

                            {/* Frame Overlay */}
                            {stats.equipped_frame && stats.equipped_frame !== 'none' && (
                                <div className="absolute inset-0 z-10 pointer-events-none scale-[1.35]">
                                    {(() => {
                                        const frame = myFrames.find(f => f.id === stats.equipped_frame);
                                        if (frame?.assetUrl?.endsWith('.json')) {
                                            return <LottiePreview url={getProxiedUrl(frame.assetUrl)} className="w-full h-full" />;
                                        } else if (frame?.assetUrl) {
                                            return <img src={getProxiedUrl(frame.assetUrl)} className="w-full h-full object-contain" alt="" />;
                                        }
                                        return null;
                                    })()}
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-discord-text-muted">Profile Picture</Label>
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                                Upload Image
                            </Button>
                            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
                            <p className="text-xs text-discord-text-muted">Square images work best.</p>
                        </div>
                    </div>


                </TabsContent>

                {/* COSMETICS TAB */}
                <TabsContent value="appearance" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* BADGE */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Equipped Badge</Label>
                        <Select onValueChange={v => equipItem(v, 'badge')} value={stats.equipped_badge || "none"}>
                            <SelectTrigger className="bg-discord-gray border-discord-light"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-discord-gray border-discord-light text-discord-text">
                                <SelectItem value="none">None</SelectItem>
                                {myBadges.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* FRAME */}
                    <div className="space-y-2">
                        <Label>Avatar Frame</Label>
                        <Select onValueChange={v => equipItem(v, 'frame')} value={stats.equipped_frame || "none"}>
                            <SelectTrigger className="bg-discord-gray border-discord-light"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-discord-gray border-discord-light text-discord-text">
                                <SelectItem value="none">None</SelectItem>
                                {myFrames.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* EFFECT */}
                    <div className="space-y-2">
                        <Label>Profile Effect</Label>
                        <Select onValueChange={v => equipItem(v, 'effect')} value={stats.equipped_effect || "none"}>
                            <SelectTrigger className="bg-discord-gray border-discord-light"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-discord-gray border-discord-light text-discord-text">
                                <SelectItem value="none">None</SelectItem>
                                {myEffects.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* NAME COLOR */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Palette className="w-4 h-4 text-purple-400" /> Name Color</Label>
                        <Select onValueChange={v => equipItem(v, 'color')} value={stats.name_color || "none"}>
                            <SelectTrigger className="bg-discord-gray border-discord-light"><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent className="bg-discord-gray border-discord-light text-discord-text">
                                <SelectItem value="none">Default</SelectItem>
                                {myColors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>

                {/* UI APPEARANCE TAB */}
                <TabsContent value="ui" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-discord-text">
                            <Monitor className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-semibold">Display Settings</h3>
                        </div>

                        <div className="space-y-3">
                            <Label>Text Size</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={textSize === 'sm' ? "default" : "outline"}
                                    onClick={() => setTextSize('sm')}
                                    className="text-xs"
                                >
                                    Small
                                </Button>
                                <Button
                                    variant={textSize === 'md' ? "default" : "outline"}
                                    onClick={() => setTextSize('md')}
                                    className="text-sm"
                                >
                                    Medium
                                </Button>
                                <Button
                                    variant={textSize === 'lg' ? "default" : "outline"}
                                    onClick={() => setTextSize('lg')}
                                    className="text-base"
                                >
                                    Large
                                </Button>
                            </div>
                            <p className="text-xs text-discord-text-muted">
                                Adjust the global text size of the application.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                {/* ACCOUNT TAB */}
                <TabsContent value="account" className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-discord-red/10 border border-discord-red/20 rounded-lg">
                        <h3 className="text-discord-red font-bold mb-2">Danger Zone</h3>
                        <p className="text-xs text-discord-red/70 mb-4">Once you sign out, you will need to log in again to access your account.</p>
                        <Button variant="destructive" className="w-full bg-discord-red hover:bg-discord-red/90" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out from Liorea
                        </Button>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
