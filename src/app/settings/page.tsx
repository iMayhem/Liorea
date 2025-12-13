"use client";

import React, { useEffect, useState } from 'react';
import { ProfileSettings } from '@/features/gamification/components/ProfileSettings';
import { api } from '@/lib/api';
import { ShopItem } from '@/features/gamification/types';
import Header from '@/components/layout/Header';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const [allItems, setAllItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.gamification.getItems()
            .then(items => {
                setAllItems(items || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex items-center justify-center h-screen bg-discord-dark pt-[72px]">
                    <Loader2 className="w-8 h-8 animate-spin text-discord-text-muted" />
                </div>
            </>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <Header />
            <div className="flex-1 pt-[72px] relative z-0">
                {/* Added pt to account for fixed header and z-0 for context */}
                <ProfileSettings
                    allItems={allItems}
                // No onClose -> dedicated page mode
                />
            </div>
        </div>
    );
}
