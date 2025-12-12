"use client";

import { useGamification } from "@/features/gamification/context/GamificationContext";
import { SHOP_ITEMS } from "@/features/gamification/data/items";
import { Coins, ShoppingBag, ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { api, getProxiedUrl } from '@/lib/api';
import { ShopItem } from "@/features/gamification/types";
import { LottiePreview } from "@/components/ui/LottiePreview";

type Category = 'all' | 'badge' | 'frame' | 'color' | 'effect';

export default function ShopPage() {
    const { stats, buyItem, equipItem, hasItem } = useGamification();
    const [category, setCategory] = useState<Category>('all');
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [dynamicItems, setDynamicItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        api.gamification.getItems().then(items => {
            if (Array.isArray(items)) setDynamicItems(items);
        }).catch(console.error);
    }, []);

    // Merge static and dynamic items, preferring dynamic if ID conflicts (or just unique)
    const allItems = [...SHOP_ITEMS, ...dynamicItems.filter(d => !SHOP_ITEMS.find(s => s.id === d.id))];

    const filteredItems = allItems.filter(item => category === 'all' || item.type === category);

    const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
        if (buyingId) return;
        setBuyingId(item.id);
        await buyItem(item.id, item.price);
        setBuyingId(null);
    };

    const handleEquip = async (item: typeof SHOP_ITEMS[0]) => {
        // Optimistic UI handled by context
        await equipItem(item.id, item.type);
    };

    const isEquipped = (item: typeof SHOP_ITEMS[0]) => {
        if (item.type === 'badge') return stats.equipped_badge === item.id;
        if (item.type === 'frame') return stats.equipped_frame === item.id;
        if (item.type === 'effect') return stats.equipped_effect === item.id;
        if (item.type === 'color') return stats.name_color === item.id;
        return false;
    };

    return (
        <div className="h-screen bg-[#111214] text-white p-6 md:p-12 font-sans overflow-y-auto pt-[80px]">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-indigo-400" />
                            Item Shop
                        </h1>
                        <p className="text-zinc-500">Customize your profile and chat appearance.</p>
                    </div>
                </div>

                <div className="bg-[#1e1f22] border border-yellow-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Balance</p>
                        <p className="text-2xl font-bold text-white tabular-nums">{stats.coins}</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['all', 'badge', 'frame', 'effect', 'color'] as Category[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-2 rounded-full border text-sm font-bold transition-all capitalize ${category === cat
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
                            }`}
                    >
                        {cat === 'all' ? 'All Items' : cat + 's'}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                className={`relative group rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center gap-4 ${equipped
                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                    : owned
                                        ? 'bg-[#1e1f22] border-zinc-700'
                                        : 'bg-[#1e1f22] border-zinc-800 hover:border-zinc-600'
                                    }`}
                            >
                                {/* Preview */}
                                <div className="h-32 mb-4 relative flex items-center justify-center p-4 bg-black/20 rounded-xl">
                                    {item.type === 'effect' && item.assetUrl ? (
                                        <LottiePreview url={getProxiedUrl(item.assetUrl)} className="w-24 h-24" />
                                    ) : item.assetUrl ? (
                                        <img src={getProxiedUrl(item.assetUrl)} className="w-24 h-24 object-contain drop-shadow-2xl" alt="" />
                                    ) : (
                                        <span className="text-6xl">{item.previewUrl || '📦'}</span>
                                    )}
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                    <p className="text-sm text-zinc-500 line-clamp-2 h-10">{item.description}</p>
                                </div>

                                <div className="mt-auto w-full pt-4">
                                    {owned ? (
                                        <button
                                            onClick={() => handleEquip(item)}
                                            disabled={equipped}
                                            className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${equipped
                                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                                                }`}
                                        >
                                            {equipped ? (
                                                <><Check className="w-4 h-4" /> Equipped</>
                                            ) : (
                                                "Equip"
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={!canAfford || buyingId === item.id}
                                            className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford
                                                ? 'bg-white hover:bg-zinc-200 text-black'
                                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                                }`}
                                        >
                                            {buyingId === item.id ? (
                                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="w-4 h-4" />
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
