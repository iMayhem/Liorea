"use client";

import { useState, useEffect } from "react";
import { SHOP_ITEMS } from "@/features/gamification/data/items";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGamification } from "@/features/gamification/context/GamificationContext";
import { useToast } from "@/hooks/use-toast";
import { api, getProxiedUrl } from "@/lib/api";
import { ShopItem } from "@/features/gamification/types";
import dynamic from 'next/dynamic';

const LottiePreview = dynamic(() => import('@/components/ui/LottiePreview').then(mod => mod.LottiePreview), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
});

export default function CosmeticsLab() {
    const { equipItem, stats } = useGamification();
    const { toast } = useToast();

    // Preview State
    const [previewBadge, setPreviewBadge] = useState<string | null>(null);
    const [previewFrame, setPreviewFrame] = useState<string | null>(null);
    const [previewColor, setPreviewColor] = useState<string | null>(null);
    const [previewEffect, setPreviewEffect] = useState<string | null>(null);
    const [dynamicItems, setDynamicItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        api.gamification.getItems().then(items => {
            if (Array.isArray(items)) setDynamicItems(items);
        }).catch(console.error);
    }, []);

    const allItems = [...SHOP_ITEMS, ...dynamicItems.filter(d => !SHOP_ITEMS.find(s => s.id === d.id))];

    const badges = allItems.filter(i => i.type === 'badge');
    const frames = allItems.filter(i => i.type === 'frame');
    const colors = allItems.filter(i => i.type === 'color');
    const effects = allItems.filter(i => i.type === 'effect');

    // Get asset URLs for preview
    const activeBadgeItem = badges.find(b => b.id === previewBadge);
    const activeFrameItem = frames.find(f => f.id === previewFrame);
    const activeColorItem = colors.find(c => c.id === previewColor);
    const activeEffectItem = effects.find(e => e.id === previewEffect);

    const handleApplyToMe = async () => {
        try {
            if (activeBadgeItem) await equipItem(activeBadgeItem.id, 'badge');
            if (activeFrameItem) await equipItem(activeFrameItem.id, 'frame');
            if (activeColorItem) await equipItem(activeColorItem.id, 'color');
            if (activeEffectItem) await equipItem(activeEffectItem.id, 'effect');

            toast({ title: "Applied!", description: "Cosmetics equipped to your profile." });
        } catch (e) {
            toast({ variant: "destructive", title: "Error applying items" });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CONTROLS PANEL */}
            <Card className="lg:col-span-2 bg-[#1e1f22]/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Cosmetic Configuration</CardTitle>
                    <CardDescription>Select items to preview on the mannequin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Profile Effect (Lottie)</label>
                            <Select onValueChange={setPreviewEffect} value={previewEffect || "none"}>
                                <SelectTrigger className="bg-black/20 border-zinc-700 h-10"><SelectValue placeholder="Select Effect" /></SelectTrigger>
                                <SelectContent className="bg-[#2b2d31] border-zinc-700 text-zinc-200">
                                    <SelectItem value="none">None</SelectItem>
                                    {effects.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Avatar Frame</label>
                            <Select onValueChange={setPreviewFrame} value={previewFrame || "none"}>
                                <SelectTrigger className="bg-black/20 border-zinc-700 h-10"><SelectValue placeholder="Select Frame" /></SelectTrigger>
                                <SelectContent className="bg-[#2b2d31] border-zinc-700 text-zinc-200">
                                    <SelectItem value="none">None</SelectItem>
                                    {frames.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Badge</label>
                            <Select onValueChange={setPreviewBadge} value={previewBadge || "none"}>
                                <SelectTrigger className="bg-black/20 border-zinc-700 h-10"><SelectValue placeholder="Select Badge" /></SelectTrigger>
                                <SelectContent className="bg-[#2b2d31] border-zinc-700 text-zinc-200">
                                    <SelectItem value="none">None</SelectItem>
                                    {badges.map(b => (
                                        <SelectItem key={b.id} value={b.id}>
                                            <span className="mr-2">{b.previewUrl}</span> {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Name Color</label>
                            <Select onValueChange={setPreviewColor} value={previewColor || "none"}>
                                <SelectTrigger className="bg-black/20 border-zinc-700 h-10"><SelectValue placeholder="Select Color" /></SelectTrigger>
                                <SelectContent className="bg-[#2b2d31] border-zinc-700 text-zinc-200">
                                    <SelectItem value="none">Default</SelectItem>
                                    {colors.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <span className={c.assetUrl?.replace('text-', 'bg-').split(' ')[0] + " inline-block w-3 h-3 rounded-full mr-2"} />
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* PREVIEW PANEL */}
            <Card className="bg-transparent border-none flex flex-col items-center justify-start">
                <div className="w-full relative shadow-2xl rounded-[32px] overflow-hidden bg-[#111214]/95 border border-white/5 backdrop-blur-xl">
                    {/* EFFECT OVERLAY */}
                    {activeEffectItem && activeEffectItem.assetUrl && (
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <LottiePreview url={getProxiedUrl(activeEffectItem.assetUrl)} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Banner */}
                    <div className="px-6 py-8 relative z-10 w-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="relative">
                                {/* Frame */}
                                {activeFrameItem && (
                                    <div className="absolute -top-[23%] -left-[23%] w-[146%] h-[146%] z-20 pointer-events-none select-none">
                                        {activeFrameItem.assetUrl?.toLowerCase().includes('.json') ? (
                                            <LottiePreview url={getProxiedUrl(activeFrameItem.assetUrl)} className="w-full h-full" />
                                        ) : (
                                            <img src={getProxiedUrl(activeFrameItem.assetUrl)} className="w-full h-full object-contain" alt="" />
                                        )}
                                    </div>
                                )}
                                {/* Avatar */}
                                <div className="w-28 h-28 rounded-full bg-[#111214] p-[5px] relative">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=PreviewUser`}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full object-cover bg-zinc-800"
                                    />
                                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-[5px] border-[#111214] z-30" />
                                </div>
                            </div>

                            {/* Badge */}
                            {activeBadgeItem && (
                                <div className="bg-[#1e1f22]/90 backdrop-blur border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 mb-2 shadow-lg">
                                    <span className="text-lg leading-none">{activeBadgeItem.previewUrl || "📦"}</span>
                                    <span className="text-xs font-bold text-zinc-200">{activeBadgeItem.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 mb-6">
                            <h2 className={`text-2xl font-bold ${activeColorItem ? 'text-transparent bg-clip-text' : 'text-white'}`}
                                style={activeColorItem ? { backgroundImage: activeColorItem.assetUrl } : {}}
                            >
                                PreviewUser
                            </h2>
                            <p className="text-zinc-400 text-sm font-medium">Cosmetic Lab Tester</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 w-full space-y-3 px-4">
                    <Button onClick={handleApplyToMe} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                        Equip to My Live Profile
                    </Button>
                    <p className="text-[10px] text-zinc-500 text-center">
                        This immediately updates your profile on the main site.
                    </p>
                </div>
            </Card>
        </div>
    );
}
