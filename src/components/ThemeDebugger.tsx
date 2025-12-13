"use client";

import { useEffect, useState } from "react";

export function ThemeDebugger() {
    const [debugInfo, setDebugInfo] = useState<{ classes: string, bgVar: string, cardVar: string }>({ classes: '', bgVar: '', cardVar: '' });

    useEffect(() => {
        const update = () => {
            if (typeof document === 'undefined') return;

            const html = document.documentElement;
            const computed = getComputedStyle(html);

            setDebugInfo({
                classes: html.className,
                bgVar: computed.getPropertyValue('--background'),
                cardVar: computed.getPropertyValue('--card')
            });
        };

        update();
        // Poll every 500ms to catch changes
        const interval = setInterval(update, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 p-4 border border-white/20 rounded-lg text-xs font-mono text-green-400 max-w-sm overflow-hidden shadow-2xl pointer-events-none">
            <h3 className="font-bold underline mb-2 text-white">Theme Debugger</h3>
            <div className="space-y-1">
                <div><span className="text-gray-400">ClassList:</span> <span className="break-all">{debugInfo.classes}</span></div>
                <div className="mt-2 text-white font-bold">Variables:</div>
                <div><span className="text-gray-400">--background:</span> {debugInfo.bgVar}</div>
                <div><span className="text-gray-400">--card:</span> {debugInfo.cardVar}</div>
            </div>
        </div>
    );
}
