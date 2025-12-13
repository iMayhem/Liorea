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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, LogOut, Save, User as UserIcon, Sparkles, Palette, X, CheckCheck, Settings, Home } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ShopItem } from '../types';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useSettings } from '@/context/SettingsContext';
import { Monitor } from 'lucide-react';

interface ProfileSettingsProps {
    allItems: ShopItem[];
    onClose?: () => void;
}

export function ProfileSettings({ allItems, onClose }: ProfileSettingsProps) {
    const { username, setUsername, userImage, setUserImage } = usePresence();
    const { stats, equipItem, refreshStats } = useGamification();
    const { toast } = useToast();
    const { textSize, setTextSize, font, setFont, theme, setTheme } = useSettings();
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
        <div className="flex h-full bg-background text-foreground overflow-hidden">
            <Tabs defaultValue="general" orientation="vertical" className="flex w-full h-full">

                {/* SIDEBAR */}
                <div className="w-64 shrink-0 flex flex-col bg-muted/30 border-r border-border pt-6 pb-4">
                    <div className="px-6 mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <Settings className="w-6 h-6 text-primary" />
                            Settings
                        </h2>
                    </div>

                    <ScrollArea className="flex-1 px-3">
                        <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 w-full text-left">
                            <TabsTrigger
                                value="general"
                                className="w-full justify-start px-4 py-2 text-discord-text-muted data-[state=active]:bg-discord-blurple data-[state=active]:text-white rounded-md transition-all font-medium"
                            >
                                <UserIcon className="w-4 h-4 mr-3" />
                                My Account
                            </TabsTrigger>
                            <TabsTrigger
                                value="ui"
                                className="w-full justify-start px-4 py-2 text-discord-text-muted data-[state=active]:bg-discord-blurple data-[state=active]:text-white rounded-md transition-all font-medium"
                            >
                                <Palette className="w-4 h-4 mr-3" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="w-full justify-start px-4 py-2 text-discord-text-muted data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 hover:text-red-400 rounded-md transition-all font-medium mt-auto"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Log Out
                            </TabsTrigger>


                            {/* Back to Home Button if not in a dialog */}
                            {!onClose && (
                                <a href="/home" className="flex items-center w-full justify-start px-4 py-2 text-discord-text-muted hover:bg-white/5 hover:text-white rounded-md transition-all font-medium mt-2">
                                    <Home className="w-4 h-4 mr-3" />
                                    Back to Home
                                </a>
                            )}

                        </TabsList>
                    </ScrollArea>
                </div>

                {/* MAIN CONTENT Area */}
                <div className="flex-1 flex flex-col h-full bg-background relative min-w-0">
                    {/* Close Button Floating - ONLY if onClose is provided */}
                    {onClose && (
                        <div className="absolute top-6 right-6 z-50">
                            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full h-8 w-8 text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    <ScrollArea className="flex-1 h-full w-full">
                        <div className="p-6 md:p-8 max-w-3xl mx-auto pb-20">

                            {/* GENERAL TAB */}
                            <TabsContent value="general" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">My Account</h2>
                                    <p className="text-discord-text-muted">Manage your profile details and avatar.</p>
                                </div>

                                {/* AVATAR SECTION */}
                                <div className="p-6 bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-8">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-24 h-24 rounded-full bg-discord-gray overflow-hidden border-4 border-discord-dark shadow-xl text-discord-text-muted flex items-center justify-center relative">
                                                {userImage ? (
                                                    <img src={userImage || undefined} className="w-full h-full object-cover" alt="avatar" />
                                                ) : (
                                                    <UserIcon className="w-10 h-10 opacity-50" />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-8 h-8 text-white" />
                                            </div>
                                            {/* Status Indicator */}
                                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-discord-dark"></div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-lg text-white">{username || 'User'}</h3>
                                                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                                                    {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                                    Change Avatar
                                                </Button>
                                                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
                                            </div>
                                            <p className="text-xs text-discord-text-muted">
                                                Recommended size: 256x256px.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* APPEARANCE TAB */}
                            <TabsContent value="ui" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
                                    <p className="text-discord-text-muted">Customize how Zenith looks and feels.</p>
                                </div>

                                <div className="space-y-8">
                                    {/* THEME */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold text-white">Theme</Label>
                                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Color Scheme</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {(
                                                [
                                                    { id: 'default', name: 'Original', color: '#313338' },
                                                    { id: 'midnight', name: 'Midnight', color: '#1e1b4b' },
                                                    { id: 'forest', name: 'Forest', color: '#052e16' },
                                                    { id: 'berry', name: 'Berry', color: '#4a044e' },
                                                    { id: 'sunset', name: 'Sunset', color: '#431407' },
                                                    { id: 'ocean', name: 'Ocean', color: '#083344' },
                                                    { id: 'lavender', name: 'Lavender', color: '#2e1065' },
                                                    { id: 'rose', name: 'Rose', color: '#4c0519' },
                                                    { id: 'slate', name: 'Slate', color: '#0f172a' },
                                                    { id: 'amber', name: 'Amber', color: '#451a03' },
                                                    { id: 'teal', name: 'Teal', color: '#042f2e' },
                                                    { id: 'emerald', name: 'Emerald', color: '#022c22' },
                                                ] as const
                                            ).map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={`group relative flex items-center gap-3 p-2 rounded-lg border transition-all hover:bg-white/5 ${theme === t.id ? 'border-discord-blurple bg-discord-blurple/10' : 'border-white/10'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-full shadow-inner shrink-0" style={{ backgroundColor: t.color }}>
                                                        {theme === t.id && (
                                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                                <CheckCheck className="w-5 h-5 drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`font-medium ${theme === t.id ? 'text-white' : 'text-discord-text'}`}>{t.name}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <div className="h-px bg-white/10" />

                                    {/* FONT */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold text-white">Font Family</Label>
                                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Typography</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['inter', 'roboto', 'lato', 'montserrat', 'open-sans'] as const).map((f) => (
                                                <div
                                                    key={f}
                                                    onClick={() => setFont(f)}
                                                    className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all hover:border-discord-blurple/50 ${font === f ? 'border-discord-blurple bg-discord-blurple/10' : 'border-white/10 bg-black/20'}`}
                                                >
                                                    <span className="capitalize text-sm font-medium" style={{ fontFamily: `var(--font-${f})` }}>
                                                        {f.replace('-', ' ')}
                                                    </span>
                                                    {font === f && <CheckCheck className="w-4 h-4 text-discord-blurple" />}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <div className="h-px bg-white/10" />

                                    {/* TEXT SIZE */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold text-white">Text Size</Label>
                                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Scaling</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-black/20 p-1 rounded-lg border border-white/10 w-fit">
                                            <Button
                                                variant={textSize === 'sm' ? "secondary" : "ghost"}
                                                onClick={() => setTextSize('sm')}
                                                className="h-8 text-xs px-4"
                                            >
                                                Small
                                            </Button>
                                            <Button
                                                variant={textSize === 'md' ? "secondary" : "ghost"}
                                                onClick={() => setTextSize('md')}
                                                className="h-8 text-sm px-4"
                                            >
                                                Medium
                                            </Button>
                                            <Button
                                                variant={textSize === 'lg' ? "secondary" : "ghost"}
                                                onClick={() => setTextSize('lg')}
                                                className="h-8 text-base px-4"
                                            >
                                                Large
                                            </Button>
                                        </div>
                                    </section>
                                </div>
                            </TabsContent>

                            {/* ACCOUNT / LOGOUT */}
                            <TabsContent value="account" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Log Out</h2>
                                    <p className="text-discord-text-muted">Are you sure you want to sign out?</p>
                                </div>
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                                            <LogOut className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Sign Out of Zenith</h3>
                                            <p className="text-red-200/60 text-sm mt-1">
                                                You will be returned to the login screen. Your settings will be saved on this device.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            variant="destructive"
                                            onClick={handleLogout}
                                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-8"
                                        >
                                            Log Out
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
}
