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
            <DialogContent className="bg-transparent border-none shadow-none p-0 overflow-visible max-w-md">
                <DialogTitle className="sr-only">{targetUsername}'s Profile</DialogTitle>
                <DialogDescription className="sr-only">User Profile Details</DialogDescription>

                {/* Main Card */}
                <div className="relative w-full aspect-[4/5] bg-[#09090b] border border-zinc-800/50 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">

                    {/* Background Effect (Dynamic) */}
                    {effectItem && effectItem.assetUrl && (
                        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                            <LottiePreview url={getProxiedUrl(effectItem.assetUrl)} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col items-center gap-6 p-8 w-full h-full justify-center">

                        {/* Avatar Section */}
                        <div className="relative group">
                            {/* Frame Layer */}
                            {frameItem && frameItem.assetUrl && (
                                <img
                                    src={getProxiedUrl(frameItem.assetUrl)}
                                    className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] z-20 pointer-events-none drop-shadow-2xl"
                                    alt=""
                                />
                            )}

                            {/* Main Avatar */}
                            <div className="w-40 h-40 rounded-full bg-[#111214] p-1.5 relative shadow-inner ring-1 ring-white/5">
                                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative z-10 flex items-center justify-center">
                                    {stats?.photoURL ? (
                                        <img
                                            src={getProxiedUrl(stats.photoURL)}
                                            alt={targetUsername || ""}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-zinc-700" />
                                    )}
                                </div>
                                {/* Online Status Dot */}
                                <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 rounded-full border-[4px] border-[#09090b] z-30 shadow-lg mb-1 mr-1" />
                            </div>
                        </div>

                        {/* User Identity */}
                        <div className="flex flex-col items-center gap-3">
                            {/* Badge */}
                            {badgeItem && (
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                                    <span className="text-xl">{badgeItem.previewUrl || "📦"}</span>
                                    <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">{badgeItem.name}</span>
                                </div>
                            )}

                            {/* Username */}
                            <h2 className={`text-3xl font-black tracking-tight text-center ${colorItem ? 'text-transparent bg-clip-text' : 'text-white'}`}
                                style={colorItem ? { backgroundImage: colorItem.assetUrl } : {}}
                            >
                                {targetUsername}
                            </h2>
                        </div>

                    </div>

                    {/* Decorative Footer Gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />
                </div>
            </DialogContent>
        </Dialog>
    );
}
