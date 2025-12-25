"use client";

import React, { useState, useRef } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, LogOut, User as UserIcon, Palette, X, CheckCheck, Settings, Home } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useSettings } from '@/context/SettingsContext';

interface ProfileSettingsProps {
    onClose?: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
    const { username, setUserImage, userImage } = usePresence();
    const { toast } = useToast();
    const { textSize, setTextSize, font, setFont, theme, setTheme } = useSettings();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                                value="account"
                                className="w-full justify-start px-4 py-2 text-discord-text-muted data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 hover:text-red-400 rounded-md transition-all font-medium mt-auto"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Log Out
                            </TabsTrigger>




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
                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-sm transition-all hover:bg-card/80 group/card">
                                    {/* Decorative Banner */}
                                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                                    </div>

                                    <div className="px-8 pb-8 -mt-12 flex flex-col items-center relative z-10">
                                        {/* Avatar */}
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-4 border-background shadow-xl flex items-center justify-center relative transition-transform group-hover:scale-105 duration-300">
                                                {userImage ? (
                                                    <img src={userImage || undefined} className="w-full h-full object-cover" alt="avatar" />
                                                ) : (
                                                    <UserIcon className="w-10 h-10 text-muted-foreground opacity-50" />
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Upload className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform duration-200" />
                                                </div>
                                            </div>

                                            {/* Status Indicator */}
                                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background shadow-sm" title="Online"></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="text-center mt-4 space-y-1">
                                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{username || 'User'}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Ready to focus?</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xs">
                                            <Button
                                                variant="outline"
                                                className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary-foreground/90 font-medium transition-all"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                Change Avatar
                                            </Button>

                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
                                                Recommended: 256x256px
                                            </p>

                                            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleUploadAvatar} />
                                        </div>
                                    </div>
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
