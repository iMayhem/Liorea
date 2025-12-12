"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "../context/UserProfileContext";
import { api } from "@/lib/api";
import { Loader2, Trophy, Coins, CalendarDays, X } from "lucide-react";
import { SHOP_ITEMS } from "../data/items";
import Lottie from "lottie-react";
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const LottiePlayer = dynamic(() => import("lottie-react"), { ssr: false });

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
}

export function UserProfileModal() {
    const { isOpen, targetUsername, closeProfile } = useUserProfile();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [effectData, setEffectData] = useState<any>(null);

    useEffect(() => {
        if (isOpen && targetUsername) {
            setLoading(true);
            const fetchStats = async () => {
                try {
                    const data = await api.gamification.getStats(targetUsername);
                    setStats(data || {
                        level: 1, xp: 0, coins: 0, inventory: [],
                        equipped: { badge: null, frame: null, effect: null, color: null }
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

    // Load Effect JSON
    useEffect(() => {
        if (stats?.equipped?.effect) {
            const effectItem = SHOP_ITEMS.find(i => i.id === stats.equipped.effect);
            // Also check dynamic items if not found in static
            if (effectItem && effectItem.assetUrl) {
                fetch(effectItem.assetUrl).then(r => r.json()).then(setEffectData).catch(console.error);
            } else {
                // Try fetching dynamic items list to find it (omitted for brevity, assume Effect is mostly static or URL based)
                // Actually, if it's dynamic, assetUrl is a URL. fetch it.
                api.gamification.getItems().then(items => {
                    const found = items.find(i => i.id === stats.equipped.effect);
                    if (found && found.assetUrl) {
                        fetch(found.assetUrl).then(r => r.json()).then(setEffectData).catch(console.error);
                    }
                })
            }
        } else {
            setEffectData(null);
        }
    }, [stats?.equipped?.effect]);


    // Resolve cosmetic items
    const badgeItem = useMemo(() => stats?.equipped?.badge ? SHOP_ITEMS.find(i => i.id === stats.equipped.badge) : null, [stats?.equipped?.badge]);
    const frameItem = useMemo(() => stats?.equipped?.frame ? SHOP_ITEMS.find(i => i.id === stats.equipped.frame) : null, [stats?.equipped?.frame]);
    const colorItem = useMemo(() => stats?.equipped?.color ? SHOP_ITEMS.find(i => i.id === stats.equipped.color) : null, [stats?.equipped?.color]);
    // Dynamic fallback for badges/frames would need the full list hook, but sticking to basic for now as fallback

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
            <Medal className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-lg font-bold text-white">{stats?.coins}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Coins</span>
        </div>
                            </div >

        {/* Achievements / Inventory Preview (Placeholder) */ }
    {
        stats?.inventory && stats.inventory.length > 0 && (
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
                                    <Medal className="w-5 h-5 text-orange-500 mb-1" />
                                    <span className="text-lg font-bold text-white">{stats?.coins}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Coins</span>
                                </div >
                            </div >
                        </div >
                    )
    }
                </div >
            </DialogContent >
        </Dialog >
    );
}
