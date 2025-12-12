"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePresence } from '@/features/study/context/PresenceContext';
import { api } from '@/lib/api';
import { db } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { GamificationStats, LEVEL_FORMULA, ShopItem } from '../types';
import { useToast } from '@/hooks/use-toast';

interface GamificationContextType {
    stats: GamificationStats;
    refreshStats: () => Promise<void>;
    awardXP: (minutes: number) => Promise<void>;
    buyItem: (itemId: string, price: number) => Promise<boolean>;
    equipItem: (itemId: string, type: 'badge' | 'frame' | 'color' | 'effect' | 'wallpaper') => Promise<boolean>;
    hasItem: (itemId: string) => boolean;
    getItem: (itemId: string) => ShopItem | undefined;
}

const DEFAULT_STATS: GamificationStats = {
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 0,
    inventory: [],
    equipped_badge: '',
    equipped_frame: '',
    equipped_effect: '',
    name_color: ''
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
    const { username } = usePresence();
    const { toast } = useToast();
    const [stats, setStats] = useState<GamificationStats>(DEFAULT_STATS);
    const [isLoading, setIsLoading] = useState(false);

    const [shopItems, setShopItems] = useState<ShopItem[]>([]);

    // Fetch Stats & Items
    const refreshStats = useCallback(async () => {
        if (!username) return;
        try {
            // Fetch Items first to ensure lookup available
            const items = await api.gamification.getItems();
            if (Array.isArray(items)) setShopItems(items);

            const data = await api.gamification.getStats(username);

            if (data) {
                // Calculate level client-side to ensure sync given new XP
                const calculatedLevel = LEVEL_FORMULA(data.xp || 0);
                setStats({
                    ...DEFAULT_STATS,
                    ...data,
                    level: calculatedLevel
                });
            }
        } catch (e) {
            console.error("Failed to load gamification stats", e);
        }
    }, [username]);

    // Initial Load
    useEffect(() => {
        if (username) refreshStats();
        // Fallback fetch for items if not logged in (though this context implies auth)
        api.gamification.getItems().then(items => {
            if (Array.isArray(items)) setShopItems(items);
        }).catch(() => { });
    }, [username, refreshStats]);

    // Real-time Signal Listener
    useEffect(() => {
        if (!username) return;
        const signalRef = ref(db, `signals/${username}/refresh_stats`);
        // Listen for "pokes" from admin
        return onValue(signalRef, () => {
            refreshStats();
        });
    }, [username, refreshStats]);

    // Award XP
    const awardXP = useCallback(async (minutes: number) => {
        if (!username) return;
        const xpAmount = minutes * 10;
        const coinsAmount = Math.floor(minutes / 5); // 1 coin per 5 mins

        // Optimistic Update
        setStats(prev => {
            const newXP = prev.xp + xpAmount;
            const newLevel = LEVEL_FORMULA(newXP);
            const newCoins = prev.coins + coinsAmount;

            if (newLevel > prev.level) {
                toast({
                    title: "Level Up! 🎉",
                    description: `You reached Level ${newLevel}!`,
                    className: "bg-yellow-500/10 border-yellow-500/50 text-yellow-200"
                });
            }

            return {
                ...prev,
                xp: newXP,
                level: newLevel,
                coins: newCoins
            };
        });

        try {
            await api.gamification.award(username, minutes);
        } catch (e) {
            console.error("Failed to sync XP", e);
            // Revert on failure? Ideally yes, but keeping simple for now
        }
    }, [username, toast]);

    const buyItem = useCallback(async (itemId: string, price: number): Promise<boolean> => {
        if (stats.coins < price) {
            toast({ title: "Insufficient Funds", variant: "destructive" });
            return false;
        }

        // Optimistic
        setStats(prev => ({
            ...prev,
            coins: prev.coins - price,
            inventory: [...prev.inventory, itemId]
        }));

        try {
            const success = await api.gamification.buy(username!, itemId, price);
            if (!success) {
                refreshStats(); // Revert
                return false;
            }
            toast({ title: "Item Purchased!", className: "bg-green-500/10 text-green-200" });
            return true;
        } catch (e) {
            console.error("Buy failed", e);
            refreshStats();
            return false;
        }
    }, [stats.coins, username, refreshStats, toast]);

    const equipItem = useCallback(async (itemId: string, type: 'badge' | 'frame' | 'color' | 'effect' | 'wallpaper') => {
        // Optimistic
        setStats(prev => {
            const update: any = {};
            if (type === 'badge') update.equipped_badge = itemId;
            if (type === 'frame') update.equipped_frame = itemId;
            if (type === 'effect') update.equipped_effect = itemId;
            if (type === 'color') update.name_color = itemId;
            // Wallpaper handled separately or via preference context usually
            return { ...prev, ...update };
        });

        try {
            await api.gamification.equip(username!, itemId, type);
            // Broadcast change to everyone
            set(ref(db, `signals/${username}/refresh_stats`), Date.now());

            // CRITICAL: Push frame update to presence immediately so chat/lists see it
            if (type === 'frame') {
                // We don't have the full presence ref here, but we can construct it
                const commRef = ref(db, `/community_presence/${username}`);
                // Using update to avoid overwriting other fields
                // Note: This relies on firebase being initialized
                const { update: firebaseUpdate } = await import('firebase/database');
                await firebaseUpdate(commRef, { equipped_frame: itemId });
            }

            return true;
        } catch (e) {
            console.error("Equip failed", e);
            return false;
        }
    }, [username]);

    const hasItem = useCallback((itemId: string) => {
        return stats.inventory.includes(itemId);
    }, [stats.inventory]);

    const getItem = useCallback((itemId: string) => {
        return shopItems.find(i => i.id === itemId);
    }, [shopItems]);

    const value = { stats, refreshStats, awardXP, buyItem, equipItem, hasItem, getItem };

    return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) throw new Error("useGamification must be used within GamificationProvider");
    return context;
};
