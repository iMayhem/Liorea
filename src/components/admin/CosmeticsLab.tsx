"use client";

import { useState } from "react";
import { SHOP_ITEMS } from "@/features/gamification/data/items";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/features/gamification/context/GamificationContext";
import { useToast } from "@/hooks/use-toast";

export default function CosmeticsLab() {
    const { equipItem, stats } = useGamification();
    const { toast } = useToast();

    // Preview State
    const [previewBadge, setPreviewBadge] = useState<string | null>(null);
    const [previewFrame, setPreviewFrame] = useState<string | null>(null);
    const [previewColor, setPreviewColor] = useState<string | null>(null);

    const badges = SHOP_ITEMS.filter(i => i.type === 'badge');
    const frames = SHOP_ITEMS.filter(i => i.type === 'frame');
    const colors = SHOP_ITEMS.filter(i => i.type === 'color');

    // Get asset URLs for preview
    const activeBadgeItem = badges.find(b => b.id === previewBadge);
    const activeFrameItem = frames.find(f => f.id === previewFrame);
    const activeColorItem = colors.find(c => c.id === previewColor);

    const handleApplyToMe = async () => {
        try {
            if (activeBadgeItem) await equipItem(activeBadgeItem.id, 'badge');
            if (activeFrameItem) await equipItem(activeFrameItem.id, 'frame');
            if (activeColorItem) await equipItem(activeColorItem.id, 'color');

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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Badge</label>
                        <Select onValueChange={setPreviewBadge} value={previewBadge || "none"}>
                            <SelectTrigger className="bg-black/20 border-zinc-700"><SelectValue placeholder="Select Badge" /></SelectTrigger>
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
                        <label className="text-sm font-medium text-zinc-400">Avatar Frame</label>
                        <Select onValueChange={setPreviewFrame} value={previewFrame || "none"}>
                            <SelectTrigger className="bg-black/20 border-zinc-700"><SelectValue placeholder="Select Frame" /></SelectTrigger>
                            <SelectContent className="bg-[#2b2d31] border-zinc-700 text-zinc-200">
                                <SelectItem value="none">None</SelectItem>
                                {frames.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Name Color</label>
                        <Select onValueChange={setPreviewColor} value={previewColor || "none"}>
                            <SelectTrigger className="bg-black/20 border-zinc-700"><SelectValue placeholder="Select Color" /></SelectTrigger>
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
                </CardContent>
            </Card>

            {/* PREVIEW PANEL */}
            <Card className="bg-[#1e1f22] border-zinc-800 flex flex-col items-center justify-center p-8">
                <CardHeader className="p-0 mb-8 w-full">
                    <CardTitle className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest">Live Preview</CardTitle>
                </CardHeader>

                <div className="relative group">
                    {/* Avatar Frame */}
                    <div className={`relative w-24 h-24 rounded-2xl bg-zinc-800 overflow-hidden mb-4 transition-all duration-300 ${activeFrameItem?.assetUrl || 'ring-0'}`}>
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        {/* Badge */}
                        {activeBadgeItem && (
                            <span className="text-xl" title={activeBadgeItem.name}>{activeBadgeItem.previewUrl}</span>
                        )}

                        {/* Name Color */}
                        <span className={`font-bold text-lg ${activeColorItem?.assetUrl || 'text-white'}`}>
                            AdminUser
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500">Global Administrator</p>
                </div>

                <div className="mt-8 w-full space-y-3">
                    <Button onClick={handleApplyToMe} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                        Apply to My Profile
                    </Button>
                    <p className="text-[10px] text-zinc-600 text-center">
                        This will check/add items to your inventory and auto-equip them.
                    </p>
                </div>
            </Card>
        </div>
    );
}
