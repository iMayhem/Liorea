"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserProfile } from "../context/UserProfileContext";
import { api, getProxiedUrl } from "@/lib/api";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Loader2, Trophy, Coins, CalendarDays, X, Shield, Star, Medal, Settings, User } from "lucide-react";
import { ShopItem } from "../types";
import { usePresence } from "@/features/study/context/PresenceContext";
import dynamic from 'next/dynamic';

const LottiePreview = dynamic(() => import('@/components/ui/LottiePreview').then(mod => mod.LottiePreview), {
    loading: () => <div className="w-full h-full bg-discord-gray animate-pulse" />,
    ssr: false
});


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
    const { username: myUsername, communityUsers } = usePresence();
    const isMe = (myUsername && targetUsername) ? myUsername.toLowerCase().trim() === targetUsername.toLowerCase().trim() : false;

    // Get real-time status from presence context
    const targetPresence = communityUsers.find(u => u.username.toLowerCase() === targetUsername?.toLowerCase());
    const aboutMe = targetPresence?.status_text || (stats?.current_streak ? `🔥 On a ${stats.current_streak} day streak!` : null);

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
                    // console.log("🔍 [UserProfileModal] Fetched Stats:", data);
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
            // Logs removed for optimization
        }
    }, [isOpen, stats, allItems, badgeItem, frameItem, effectItem]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
            <DialogContent className="bg-transparent border-none shadow-none p-0 overflow-visible w-[340px] max-w-[340px]">
                <DialogTitle className="sr-only">{targetUsername}'s Profile</DialogTitle>
                <DialogDescription className="sr-only">User Profile Details</DialogDescription>

                <div className="w-[340px] bg-[#111214] rounded-lg overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">

                    {/* BANNER (105px height typical for Discord user popout) */}
                    <div className="h-[105px] w-full bg-discord-blurple relative overflow-hidden">
                        {effectItem && effectItem.assetUrl ? (
                            <LottiePreview url={getProxiedUrl(effectItem.assetUrl)} className="w-full h-full object-cover opacity-80" />
                        ) : colorItem && colorItem.assetUrl ? (
                            <div className={`w-full h-full ${colorItem.assetUrl.replace('text-', 'bg-')}`} />
                        ) : (
                            <div className="w-full h-full bg-[#1e1f22]" /> // Default empty/gray banner if no color
                        )}

                        {/* Edit Profile Button (Top Right) */}
                        {isMe && (
                            <button onClick={() => { closeProfile(); document.getElementById('settings-trigger')?.click(); }} className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20">
                                <Settings className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>

                    {/* AVATAR (Overlapping) - 80px size + 6px border */}
                    <div className="absolute top-[60px] left-[16px] z-20">
                        {/* Frame Layer */}
                        {frameItem && frameItem.assetUrl && (
                            <img
                                src={getProxiedUrl(frameItem.assetUrl)}
                                className="absolute -top-[16%] -left-[16%] w-[132%] h-[132%] z-30 pointer-events-none drop-shadow-lg"
                                alt=""
                            />
                        )}
                        <div className="w-[92px] h-[92px] rounded-full bg-[#111214] p-[6px] relative flex items-center justify-center">
                            <div className="w-full h-full rounded-full overflow-hidden bg-discord-gray relative z-10">
                                {stats?.photoURL ? (
                                    <img
                                        src={getProxiedUrl(stats.photoURL)}
                                        alt={targetUsername || ""}
                                        className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-discord-gray">
                                        <User className="w-10 h-10 text-discord-text-muted" />
                                    </div>
                                )}
                            </div>
                            {/* Online Status (Green Dot) */}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-[5px] border-[#111214] z-40" />
                        </div>
                    </div>

                    {/* BADGES (Top Right of Body - Aligned with Avatar) */}
                    <div className="h-[60px] w-full flex justify-end items-center px-4 pt-2 gap-2">
                        {badgeItem && (
                            <div className="w-[30px] h-[30px] flex items-center justify-center" title={badgeItem.name}>
                                <span className="text-xl">{badgeItem.previewUrl || "📦"}</span>
                            </div>
                        )}
                        <div className="w-[30px] h-[30px] flex items-center justify-center cursor-not-allowed" title="Early Supporter">
                            <Shield className="w-5 h-5 text-[#5865F2]" />
                        </div>
                    </div>

                    {/* BODY CONTENT */}
                    <div className="px-4 pb-4 pt-1 bg-[#111214]">

                        {/* Identity */}
                        <div className="bg-[#111214] rounded-lg p-3 mb-3">
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {targetUsername}
                            </h2>
                            <p className="text-sm text-discord-text-muted">
                                {targetUsername?.toLowerCase()}
                            </p>
                        </div>

                        <div className="w-full h-[1px] bg-[#2b2d31] mb-3 mx-2" />

                        {/* ABOUT ME Section */}
                        <div className="mb-4 px-2">
                            <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase mb-1.5 tracking-wide">About Me</h3>
                            <div className="text-sm text-[#dbdee1] leading-relaxed">
                                {stats?.current_streak ? `🔥 On a ${stats.current_streak} day streak!` : "Just keeping it chill."}
                            </div>
                        </div>

                        {/* MEMBER SINCE Section */}
                        <div className="mb-4 px-2">
                            <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase mb-1.5 tracking-wide">Member Since</h3>
                            <div className="text-sm text-[#dbdee1]">
                                {stats?.joinDate ? new Date(stats.joinDate).toLocaleDateString() : "Dec 12, 2025"}
                            </div>
                        </div>

                        {/* ROLES Section */}
                        <div className="mb-2 px-2">
                            <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase mb-1.5 tracking-wide">Roles</h3>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-[#2b2d31] rounded text-xs text-[#dbdee1] font-medium border border-transparent">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#5865F2]" /> User
                                </span>
                                {isMe && (
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-[#2b2d31] rounded text-xs text-[#dbdee1] font-medium border border-transparent">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#23a559]" /> You
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER Message Box */}
                    {!isMe && (
                        <div className="p-4 bg-[#111214] border-t border-transparent">
                            <input
                                type="text"
                                placeholder={`Message @${targetUsername}`}
                                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm rounded-lg px-3 py-2.5 border-none outline-none placeholder:text-[#949ba4] transition-all font-medium"
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
