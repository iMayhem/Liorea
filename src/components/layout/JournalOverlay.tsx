"use client";

import { cn } from '@/lib/utils';
import { Construction, Sparkles, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function JournalOverlay() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto"
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

            {/* Content Card */}
            <div
                className={cn(
                    "relative z-10 p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl max-w-md text-center transition-all duration-500 ease-out transform",
                    isHovered ? "scale-105 border-primary/50 bg-black/60" : "scale-100 hover:scale-105"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    boxShadow: isHovered
                        ? '0 0 50px -12px rgba(var(--primary-rgb), 0.5)'
                        : '0 0 30px -10px rgba(0,0,0,0.5)'
                }}
            >
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className={cn(
                            "absolute inset-0 bg-primary/20 blur-xl rounded-full transition-all duration-500",
                            isHovered ? "opacity-100 scale-150" : "opacity-0 scale-100"
                        )} />
                        <Construction className="w-16 h-16 text-primary relative z-10" />
                        <Sparkles
                            className={cn(
                                "absolute -top-2 -right-2 w-6 h-6 text-yellow-400 transition-all duration-700",
                                isHovered ? "opacity-100 rotate-12 scale-110" : "opacity-0 rotate-0 scale-0"
                            )}
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Under Construction
                </h2>

                <p className="text-white/60 text-lg leading-relaxed">
                    We are crafting a better Journal experience for you.
                    <br />
                    <span className="text-primary font-medium mt-2 block">
                        Stay tuned for something amazing!
                    </span>
                </p>

                {/* Decorative elements */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000" />
            </div>
        </div>
    );
}
