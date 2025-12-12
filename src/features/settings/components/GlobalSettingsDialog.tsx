"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ProfileSettings } from '@/features/gamification/components/ProfileSettings';
import { api } from '@/lib/api';
import { ShopItem } from '@/features/gamification/types';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';

export function GlobalSettingsDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [allItems, setAllItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        if (isOpen && allItems.length === 0) {
            api.gamification.getItems().then(items => setAllItems(items || [])).catch(console.error);
        }
    }, [isOpen, allItems.length]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 rounded-full" title="Global Settings">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] p-0 bg-transparent border-none shadow-none text-white overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>Global Settings</DialogTitle>
                </VisuallyHidden>
                <div className="bg-[#09090b] border border-zinc-800 rounded-xl h-full flex flex-col overflow-hidden shadow-2xl relative z-50">
                    <ProfileSettings
                        allItems={allItems}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
