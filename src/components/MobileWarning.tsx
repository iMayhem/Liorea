"use client";

import React from 'react';
import { Monitor } from 'lucide-react';

export default function MobileWarning() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground p-6 text-center md:hidden">
            <div className="bg-muted/30 p-4 rounded-full mb-6">
                <Monitor className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Desktop Only</h1>
            <p className="text-muted-foreground text-sm max-w-xs">
                Zenith is designed for a rich desktop experience. Please open this site on your computer for the best experience.
            </p>
        </div>
    );
}
