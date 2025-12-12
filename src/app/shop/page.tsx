"use client";

import { useGamification } from "@/features/gamification/context/GamificationContext";
import { Coins, ShoppingBag, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, getProxiedUrl } from '@/lib/api';
import { ShopItem } from "@/features/gamification/types";
import { LottiePreview } from "@/components/ui/LottiePreview";

type Category = 'all' | 'badge' | 'frame' | 'color' | 'effect';

export default function ShopPage() {
    const { stats, buyItem, equipItem, hasItem } = useGamification();
    const [category, setCategory] = useState<Category>('all');
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        api.gamification.getItems().then(data => {
            if (Array.isArray(data)) setItems(data);
        }).catch(console.error);
    }, []);

    const filteredItems = items.filter(item => category === 'all' || item.type === category);

    const handleBuy = async (item: ShopItem) => {
        if (buyingId) return;
        setBuyingId(item.id);
        await buyItem(item.id, item.price);
        setBuyingId(null);
    };

    const handleEquip = async (item: ShopItem) => {
        await equipItem(item.id, item.type);
    };

    const isEquipped = (item: ShopItem) => {
        if (item.type === 'badge') return stats.equipped_badge === item.id;
        if (item.type === 'frame') return stats.equipped_frame === item.id;
        if (item.type === 'effect') return stats.equipped_effect === item.id;
        if (item.type === 'color') return stats.name_color === item.id;
        return false;
    };

    return (
        <div className="h-screen bg-discord-dark text-discord-text p-4 md:p-8 font-sans overflow-y-auto pt-[80px]">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-indigo-400" />
                            Item Shop
                        </h1>
                        <p className="text-discord-text-muted text-sm">Customize your profile and chat appearance.</p>
                    </div>
                </div>

                <div className="bg-discord-gray border border-yellow-500/20 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Coins className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-discord-text-muted uppercase font-bold tracking-wider">Balance</p>
                        <p className="text-lg font-bold text-discord-text tabular-nums">{stats.coins}</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['all', 'badge', 'frame', 'effect', 'color'] as Category[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all capitalize ${category === cat
                            ? 'bg-discord-text text-discord-dark border-discord-text'
                            : 'bg-transparent text-discord-text-muted border-discord-light hover:border-discord-text hover:text-discord-text'
                            }`}
                    >
                        {cat === 'all' ? 'All' : cat + 's'}
                    </button>
                ))}
            </div>

            {/* Grid - Compact Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => {
                        const owned = hasItem(item.id);
                        const equipped = isEquipped(item);
                        const canAfford = stats.coins >= item.price;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.id}
                                className={`relative group rounded-xl p-3 border transition-all duration-300 flex flex-col items-center gap-2 ${equipped
                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                    : owned
                                        ? 'bg-discord-gray border-discord-light'
                                        : 'bg-discord-gray border-discord-light hover:border-discord-text-muted'
                                    }`}
                            >
                                {/* Preview */}
                                <div className="h-24 w-full relative flex items-center justify-center p-2 bg-black/20 rounded-lg overflow-hidden">
                                    {item.type === 'effect' && item.assetUrl ? (
                                        <LottiePreview url={getProxiedUrl(item.assetUrl)} className="w-20 h-20" />
                                    ) : item.assetUrl ? (
                                        <img src={getProxiedUrl(item.assetUrl)} className="w-20 h-20 object-contain drop-shadow-xl" alt="" />
                                    ) : (
                                        <span className="text-4xl">{item.previewUrl || '📦'}</span>
                                    )}
                                </div>

                                <div className="text-center w-full">
                                    <h3 className="font-bold text-sm text-discord-text truncate px-1" title={item.name}>{item.name}</h3>
                                    <p className="text-[10px] text-discord-text-muted line-clamp-1 h-4 px-1">{item.description}</p>
                                </div>

                                <div className="mt-auto w-full pt-1">
                                    {owned ? (
                                        <button
                                            onClick={() => handleEquip(item)}
                                            disabled={equipped}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${equipped
                                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                                : 'bg-discord-light hover:bg-discord-gray text-discord-text'
                                                }`}
                                        >
                                            {equipped ? <><Check className="w-3 h-3" /> ON</> : "Equip"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={!canAfford || buyingId === item.id}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${canAfford
                                                ? 'bg-discord-text hover:bg-zinc-200 text-black'
                                                : 'bg-discord-light text-discord-text-muted cursor-not-allowed opacity-50'
                                                }`}
                                        >
                                            {buyingId === item.id ? (
                                                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="w-3 h-3" />
                                                    {item.price}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
