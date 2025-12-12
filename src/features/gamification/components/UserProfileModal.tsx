"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserProfile } from "../context/UserProfileContext";
import { api, getProxiedUrl } from "@/lib/api";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Loader2, Trophy, Coins, CalendarDays, X, Shield, Star, Medal, Settings, User } from "lucide-react";
import { SHOP_ITEMS } from "../data/items";
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
    const [allItems, setAllItems] = useState<ShopItem[]>(SHOP_ITEMS);

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
                const newItems = items.filter(d => !SHOP_ITEMS.find(s => s.id === d.id));
                setAllItems([...SHOP_ITEMS, ...newItems]);
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
            <DialogContent className="bg-transparent border-none shadow-none p-0 overflow-visible max-w-sm sm:max-w-md">
                <DialogTitle className="sr-only">{targetUsername}'s Profile</DialogTitle>
                <DialogDescription className="sr-only">User Profile Details</DialogDescription>

                {/* Main Card */}
                <div className="relative w-full bg-[#111214]/95 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 min-h-[400px]">
                    {/* Profile Effect (Overlay) */}
                    {effectItem && effectItem.assetUrl && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <LottiePreview url={getProxiedUrl(effectItem.assetUrl)} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-8 relative z-10 w-full">

                        {/* Avatar Section */}
                        <div className="relative mb-4 flex justify-between items-start">
                            <div className="relative">
                                {/* Frame Overlay */}
                                {frameItem && frameItem.assetUrl && (
                                    <img
                                        src={getProxiedUrl(frameItem.assetUrl)}
                                        className="absolute -top-[16%] -left-[16%] w-[132%] h-[132%] z-20 pointer-events-none"
                                        alt=""
                                    />
                                )}

                                {/* Avatar */}
                                <div className="w-28 h-28 rounded-full bg-[#111214] p-[5px] relative">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 relative z-10 flex items-center justify-center">
                                        {stats?.photoURL ? (
                                            <img
                                                src={getProxiedUrl(stats.photoURL)}
                                                alt={targetUsername || ""}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-zinc-600" />
                                        )}
                                    </div>
                                    {/* Status Dot */}
                                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-[5px] border-[#111214] z-30" />
                                </div>
                            </div>

                            {/* Badge */}
                            {badgeItem && (
                                <div className="bg-[#1e1f22]/90 backdrop-blur border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 mb-2 shadow-lg">
                                    <span className="text-lg leading-none">{badgeItem.previewUrl || "📦"}</span>
                                    <span className="text-xs font-bold text-zinc-200">{badgeItem.name}</span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="space-y-1 mb-6">
                            <h2 className={`text-2xl font-bold ${colorItem ? 'text-transparent bg-clip-text' : 'text-white'}`}
                                style={colorItem ? { backgroundImage: colorItem.assetUrl } : {}}
                            >
                                {targetUsername}
                            </h2>
                            <p className="text-zinc-400 text-sm font-medium">Explorer of the Digital Realm</p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-white/5 mb-6" />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-[#1e1f22]/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-[#1e1f22] transition-colors">
                                <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                                <span className="text-2xl font-bold text-white">{stats?.xp?.toLocaleString() || 0}</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total XP</span>
                            </div>
                            <div className="bg-[#1e1f22]/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-[#1e1f22] transition-colors">
                                <Coins className="w-5 h-5 text-amber-400 mb-1" />
                                <span className="text-2xl font-bold text-white">{stats?.coins?.toLocaleString() || 0}</span>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Coins</span>
                            </div>
                        </div>

                        <div className="bg-[#1e1f22]/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-[#1e1f22] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <span className="text-lg">🔥</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Current Streak</span>
                                    <span className="text-xs text-zinc-500">Keep the momentum!</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-white">{stats?.current_streak || 0}</span>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
