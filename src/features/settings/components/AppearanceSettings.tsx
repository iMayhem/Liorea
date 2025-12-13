"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, CheckCheck, X } from "lucide-react";
import { useSettings } from '@/context/SettingsContext';

interface AppearanceSettingsProps {
    onClose?: () => void;
}

export function AppearanceSettings({ onClose }: AppearanceSettingsProps) {
    const { textSize, setTextSize, font, setFont, theme, setTheme } = useSettings();

    return (
        <div className="flex h-full bg-background text-foreground overflow-hidden flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border bg-muted/30">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Palette className="w-6 h-6 text-primary" />
                    Appearance
                </h2>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full h-8 w-8 text-white/50 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 h-full w-full">
                <div className="p-6 md:p-8 max-w-3xl mx-auto pb-20 space-y-8">
                    <div>
                        <p className="text-discord-text-muted">Customize how Zenith looks and feels.</p>
                    </div>

                    {/* THEME */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-white">Theme</Label>
                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Color Scheme</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(
                                [
                                    { id: 'default', name: 'Original', color: '#313338' },
                                    { id: 'midnight', name: 'Midnight', color: '#1e1b4b' },
                                    { id: 'forest', name: 'Forest', color: '#052e16' },
                                    { id: 'berry', name: 'Berry', color: '#4a044e' },
                                    { id: 'sunset', name: 'Sunset', color: '#431407' },
                                    { id: 'ocean', name: 'Ocean', color: '#083344' },
                                    { id: 'lavender', name: 'Lavender', color: '#2e1065' },
                                    { id: 'rose', name: 'Rose', color: '#4c0519' },
                                    { id: 'slate', name: 'Slate', color: '#0f172a' },
                                    { id: 'amber', name: 'Amber', color: '#451a03' },
                                    { id: 'teal', name: 'Teal', color: '#042f2e' },
                                    { id: 'emerald', name: 'Emerald', color: '#022c22' },
                                ] as const
                            ).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`group relative flex items-center gap-3 p-2 rounded-lg border transition-all hover:bg-white/5 ${theme === t.id ? 'border-discord-blurple bg-discord-blurple/10' : 'border-white/10'}`}
                                >
                                    <div className="w-10 h-10 rounded-full shadow-inner shrink-0" style={{ backgroundColor: t.color }}>
                                        {theme === t.id && (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                <CheckCheck className="w-5 h-5 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-medium ${theme === t.id ? 'text-white' : 'text-discord-text'}`}>{t.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-white/10" />

                    {/* FONT */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-white">Font Family</Label>
                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Typography</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(['inter', 'roboto', 'lato', 'montserrat', 'open-sans', 'poppins', 'oswald', 'playfair', 'merriweather', 'space-mono', 'nunito', 'raleway', 'ubuntu'] as const).map((f) => (
                                <div
                                    key={f}
                                    onClick={() => setFont(f)}
                                    className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all hover:border-discord-blurple/50 ${font === f ? 'border-discord-blurple bg-discord-blurple/10' : 'border-white/10 bg-black/20'}`}
                                >
                                    <span className="capitalize text-sm font-medium" style={{ fontFamily: `var(--font-${f})` }}>
                                        {f.replace('-', ' ')}
                                    </span>
                                    {font === f && <CheckCheck className="w-4 h-4 text-discord-blurple" />}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-white/10" />

                    {/* TEXT SIZE */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-white">Text Size</Label>
                            <span className="text-xs text-discord-text-muted uppercase tracking-wider font-bold">Scaling</span>
                        </div>
                        <div className="flex items-center gap-4 bg-black/20 p-1 rounded-lg border border-white/10 w-fit">
                            <Button
                                variant={textSize === 'sm' ? "secondary" : "ghost"}
                                onClick={() => setTextSize('sm')}
                                className="h-8 text-xs px-4"
                            >
                                Small
                            </Button>
                            <Button
                                variant={textSize === 'md' ? "secondary" : "ghost"}
                                onClick={() => setTextSize('md')}
                                className="h-8 text-sm px-4"
                            >
                                Medium
                            </Button>
                            <Button
                                variant={textSize === 'lg' ? "secondary" : "ghost"}
                                onClick={() => setTextSize('lg')}
                                className="h-8 text-base px-4"
                            >
                                Large
                            </Button>
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
