"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with lottie-react
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottiePreviewProps {
    url: string;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
}

export function LottiePreview({ url, className, loop = true, autoplay = true }: LottiePreviewProps) {
    const [animationData, setAnimationData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) return;

        // Prevent re-fetching if already loaded (basic cache could be added here if needed)
        setLoading(true);
        setError(false);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch Lottie");
                return res.json();
            })
            .then(data => {
                setAnimationData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lottie fetch error:", err);
                setError(true);
                setLoading(false);
            });
    }, [url]);

    if (error) return <div className={`flex items-center justify-center bg-red-500/10 text-red-500 text-[10px] ${className}`}>Error</div>;
    if (loading) return <div className={`flex items-center justify-center ${className}`}><Loader2 className="w-4 h-4 animate-spin text-zinc-500" /></div>;

    return (
        <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            className={className}
        />
    );
}
