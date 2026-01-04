"use client";

import { getLatestVersion } from '@/lib/changelog';
import { useEffect, useState } from 'react';

export default function VersionInfo() {
    const [version, setVersion] = useState('1.0.2');

    useEffect(() => {
        // Fetch version from API route
        fetch('/api/version')
            .then(res => res.json())
            .then(data => setVersion(data.version))
            .catch(() => setVersion('1.0.2')); // Fallback
    }, []);

    return (
        <div className="fixed bottom-2 right-2 text-[10px] text-muted-foreground/30 font-mono select-none pointer-events-none z-50">
            v{version}
        </div>
    );
}
