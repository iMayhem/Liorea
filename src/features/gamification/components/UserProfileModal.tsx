"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserProfile } from "../context/UserProfileContext";
import { api } from "@/lib/api";
import { Loader2, Trophy, Medal, Star, Shield } from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import { XPProgressBar } from "../components/XPProgressBar";
import { SHOP_ITEMS } from "../data/items";

interface ProfileStats {
    level: number;
    xp: number;
    coins: number;
    inventory: string[];
    equipped: {
        badge: string | null;
        frame: string | null;
        color: string | null;
    };
    joinDate?: string;
}

export function UserProfileModal() {
    const { isOpen, targetUsername, closeProfile } = useUserProfile();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProfileStats | null>(null);

    useEffect(() => {
        if (isOpen && targetUsername) {
            setLoading(true);
            const fetchStats = async () => {
                try {
                    const data = await api.gamification.getStats(targetUsername);
                    setStats(data || {
                        level: 1, xp: 0, coins: 0, inventory: [],
                        equipped: { badge: null, frame: null, color: null }
                    });
                } catch (e) {
                    console.error("Failed to load profile", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [isOpen, targetUsername]);

    if (!isOpen) return null;

    // Resolve cosmetic items
    const badgeItem = stats?.equipped?.badge ? SHOP_ITEMS.find(i => i.id === stats.equipped.badge) : null;
    const frameItem = stats?.equipped?.frame ? SHOP_ITEMS.find(i => i.id === stats.equipped.frame) : null;
    const colorItem = stats?.equipped?.color ? SHOP_ITEMS.find(i => i.id === stats.equipped.color) : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
            <DialogContent className="bg-[#18181b] border-zinc-800 text-white p-0 overflow-hidden max-w-md">
                {/* Header / Banner Area */}
                <div className="h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <button
                        onClick={closeProfile}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-6 pb-8 -mt-12 relative">
                    {/* Avatar & badge */}
                    <div className="flex justify-between items-end mb-4">
                        <div className={`relative w-24 h-24 rounded-2xl bg-zinc-800 border-4 border-[#18181b] shadow-xl overflow-hidden ${frameItem?.assetUrl || ''}`}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`}
                                alt={targetUsername || "User"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {badgeItem && (
                            <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 px-3 py-1.5 rounded-full flex items-center gap-2 mb-2">
                                <span className="text-xl">{badgeItem.previewUrl}</span>
                                <span className="text-xs font-bold text-zinc-300">{badgeItem.name}</span>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Identity */}
                            <div>
                                <h2 className={`text-2xl font-bold ${colorItem?.assetUrl || 'text-white'}`}>
                                    {targetUsername}
                                </h2>
                                <p className="text-zinc-500 text-sm">Level {stats?.level} Scholar</p>
                            </div>

                            {/* Level Progress */}
                            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3 h-3 text-indigo-400" /> Current Progress
                                    </span>
                                    <span className="text-zinc-500">{Math.floor(stats?.xp || 0)} XP</span>
                                </div>
                                {/* Use a custom progress bar wrapper since we don't have direct access to stats in the generic XPProgressBar without context override */}
                                <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                                    {/* Simplified calculation for display */}
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        style={{ width: `${Math.min(100, ((stats?.xp || 0) % 50) / 0.5)}%` }} // Rough approx for MVP
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                                    Keep studying to reach Level {(stats?.level || 1) + 1}!
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30 flex flex-col items-center justify-center text-center">
                                    <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                                    <span className="text-lg font-bold text-white">{stats?.level}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Level</span>
                                </div>
                                <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30 flex flex-col items-center justify-center text-center">
                                    <Medal className="w-5 h-5 text-orange-500 mb-1" />
                                    <span className="text-lg font-bold text-white">{stats?.coins}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Coins</span>
                                </div>
                            </div>

                            {/* Achievements / Inventory Preview (Placeholder) */}
                            {stats?.inventory && stats.inventory.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Collection</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.inventory.slice(0, 5).map(itemId => {
                                            const item = SHOP_ITEMS.find(i => i.id === itemId);
                                            if (!item) return null;
                                            return (
                                                <div key={itemId} className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg" title={item.name}>
                                                    {item.previewUrl || '📦'}
                                                </div>
                                            );
                                        })}
                                        {stats.inventory.length > 5 && (
                                            <div className="w-8 h-8 rounded bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-xs text-zinc-500">
                                                +{stats.inventory.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
