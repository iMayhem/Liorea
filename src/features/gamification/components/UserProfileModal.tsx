"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserProfile } from "../context/UserProfileContext";
import { api, getProxiedUrl } from "@/lib/api";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Loader2, Trophy, Coins, CalendarDays, X, Shield, Star, Medal, Settings, User } from "lucide-react";
import { ShopItem } from "../types";
import { LottiePreview } from "@/components/ui/LottiePreview";
import { usePresence } from "@/features/study/context/PresenceContext";


interface ProfileStats {
    level: number;
    xp: number;
    coins: number;
    inventory: string[];
    equipped: {
        badge: string | null;
        frame: string | null;
        effect: string | null;
        color: string | null;
    };
    joinDate?: string;
    current_streak?: number;
    photoURL?: string | null;
}

export function UserProfileModal() {
    const { isOpen, targetUsername, closeProfile } = useUserProfile();
    const { username: myUsername } = usePresence();
    const isMe = (myUsername && targetUsername) ? myUsername.toLowerCase().trim() === targetUsername.toLowerCase().trim() : false;

    useEffect(() => {
        if (isOpen) {
            console.log("🔍 [UserProfileModal] Visibility Debug:", { myUsername, targetUsername, isMe });
        }
    }, [isOpen, myUsername, targetUsername, isMe]);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [allItems, setAllItems] = useState<ShopItem[]>([]);

    // Refresh Key for signals
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (isOpen && targetUsername) {
            if (!stats) setLoading(true);

            const fetchStats = async () => {
                try {
                    const data = await api.gamification.getStats(targetUsername);
                    console.log("🔍 [UserProfileModal] Fetched Stats:", data);
                    // Map flat API response to nested structure
                    setStats({
                        level: 1, // Placeholder
                        xp: data.xp || 0,
                        coins: data.coins || 0,
                        inventory: data.inventory || [],
                        equipped: {
                            badge: data.equipped_badge || null,
                            frame: data.equipped_frame || null,
                            effect: data.equipped_effect || null,
                            color: data.name_color || null
                        },
                        current_streak: data.current_streak || 0,
                        photoURL: data.photoURL || null
                    });
                } catch (e) {
                    console.error("Failed to load profile", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [isOpen, targetUsername, refreshKey]);

    // Listen for Real-time Updates
    useEffect(() => {
        if (!isOpen || !targetUsername) return;
        const signalRef = ref(db, `signals/${targetUsername}/refresh_stats`);
        return onValue(signalRef, (snapshot) => {
            // Force refresh when signal comes
            setRefreshKey(k => k + 1);
        });
    }, [isOpen, targetUsername]);

    // Fetch Dynamic Items on Mount
    useEffect(() => {
        api.gamification.getItems().then(items => {
            if (Array.isArray(items)) {
                setAllItems(items);
            }
        }).catch(e => console.error("Failed to fetch dynamic items", e));
    }, []);

    const getItem = (id: string) => allItems.find(i => i.id === id);

    // Resolve cosmetic items
    const badgeItem = useMemo(() => stats?.equipped?.badge ? getItem(stats.equipped.badge) : null, [stats?.equipped?.badge, allItems]);
    const frameItem = useMemo(() => stats?.equipped?.frame ? getItem(stats.equipped.frame) : null, [stats?.equipped?.frame, allItems]);
    const colorItem = useMemo(() => stats?.equipped?.color ? getItem(stats.equipped.color) : null, [stats?.equipped?.color, allItems]);
    const effectItem = useMemo(() => stats?.equipped?.effect ? getItem(stats.equipped.effect) : null, [stats?.equipped?.effect, allItems]);

    // DEBUG LOGS
    useEffect(() => {
        if (isOpen) {
            console.log("🔍 [UserProfileModal] Stats:", stats);
            console.log("🔍 [UserProfileModal] All Items:", allItems);
            console.log("🔍 [UserProfileModal] Resolved Badge:", badgeItem);
            console.log("🔍 [UserProfileModal] Resolved Frame:", frameItem);
            console.log("🔍 [UserProfileModal] Resolved Effect:", effectItem);
        }
    }, [isOpen, stats, allItems, badgeItem, frameItem, effectItem]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
            <DialogContent className="bg-transparent border-none shadow-none p-0 overflow-visible w-[340px] max-w-[340px]">
                <DialogTitle className="sr-only">{targetUsername}'s Profile</DialogTitle>
                <DialogDescription className="sr-only">User Profile Details</DialogDescription>

                <div className="w-full bg-discord-dark rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">

                    {/* BANNER */}
                    <div className="h-[120px] w-full bg-discord-blurple relative overflow-hidden">
                        {effectItem && effectItem.assetUrl ? (
                            <LottiePreview url={getProxiedUrl(effectItem.assetUrl)} className="w-full h-full object-cover opacity-80" />
                        ) : colorItem && colorItem.assetUrl ? (
                            <div className={`w-full h-full ${colorItem.assetUrl.replace('text-', 'bg-')}`} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                        )}
                    </div>

                    {/* AVATAR (Overlapping) */}
                    <div className="absolute top-[76px] left-[20px] z-20">
                        {/* Frame Layer */}
                        {frameItem && frameItem.assetUrl && (
                            <img
                                src={getProxiedUrl(frameItem.assetUrl)}
                                className="absolute -top-[16%] -left-[16%] w-[132%] h-[132%] z-30 pointer-events-none drop-shadow-lg"
                                alt=""
                            />
                        )}
                        <div className="w-[88px] h-[88px] rounded-full bg-discord-dark p-[6px] relative">
                            <div className="w-full h-full rounded-full overflow-hidden bg-discord-light relative z-10">
                                {stats?.photoURL ? (
                                    <img
                                        src={getProxiedUrl(stats.photoURL)}
                                        alt={targetUsername || ""}
                                        className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-discord-light">
                                        <User className="w-10 h-10 text-discord-text-muted" />
                                    </div>
                                )}
                            </div>
                            {/* Online Status */}
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-discord-green rounded-full border-[5px] border-discord-dark z-40" />
                        </div>
                    </div>

                    {/* ACTIONS / BADGES (Top Right of Body) */}
                    <div className="h-[60px] w-full flex justify-end items-start p-3 gap-2">
                        {badgeItem && (
                            <div className="w-8 h-8 rounded-lg bg-discord-gray flex items-center justify-center border border-discord-light shadow-sm" title={badgeItem.name}>
                                <span className="text-lg">{badgeItem.previewUrl || "📦"}</span>
                            </div>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-discord-gray flex items-center justify-center border border-discord-light shadow-sm cursor-not-allowed">
                            <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                    </div>

                    {/* BODY CONTENT */}
                    <div className="px-5 pb-5 mt-2 bg-discord-dark">

                        {/* Identity */}
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-discord-text leading-tight flex items-center gap-2">
                                {targetUsername}
                            </h2>
                            <p className="text-sm text-discord-text-muted font-medium">
                                {targetUsername?.toLowerCase()}
                            </p>
                        </div>

                        <div className="w-full h-[1px] bg-discord-light mb-4" />

                        {/* Custom Status / About */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-discord-text-muted uppercase mb-2 tracking-wide">About Me</h3>
                            <div className="text-sm text-discord-text leading-relaxed max-h-[80px] overflow-hidden whitespace-pre-wrap">
                                {stats?.current_streak ? `🔥 On a ${stats.current_streak} day streak!` : "Just keeping it chill."}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-discord-text-muted uppercase mb-2 tracking-wide">Member Since</h3>
                            <div className="text-sm text-discord-text-muted flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-discord-text-muted" />
                                <span>{stats?.joinDate ? new Date(stats.joinDate).toLocaleDateString() : "Dec 12, 2025"}</span>
                            </div>
                        </div>

                        {/* Mock Roles */}
                        <div className="mb-2">
                            <h3 className="text-xs font-bold text-discord-text-muted uppercase mb-2 tracking-wide">Roles</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded bg-discord-gray border border-discord-light text-xs text-discord-text-muted flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Member
                                </span>
                                {isMe && (
                                    <span className="px-2 py-1 rounded bg-discord-gray border border-discord-light text-xs text-discord-text-muted flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" /> You
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>
                    {/* FOOTER Message Box */}
                    {!isMe && (
                        <div className="p-4 bg-discord-dark border-t border-discord-light">
                            <input
                                type="text"
                                placeholder={`Message @${targetUsername}`}
                                className="w-full bg-discord-gray text-discord-text text-sm rounded-lg px-3 py-2.5 border-none outline-none focus:ring-1 focus:ring-discord-blurple/50 placeholder:text-discord-text-muted transition-all font-medium"
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
