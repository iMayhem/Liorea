"use client";

import { version } from '../../package.json';

export default function VersionInfo() {
    return (
        <div className="fixed bottom-2 right-2 text-[10px] text-muted-foreground/30 font-mono select-none pointer-events-none z-50">
            v{version} (Beta)
        </div>
    );
}
