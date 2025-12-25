"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bug, Zap, Wrench, Calendar, ChevronLeft } from "lucide-react";

interface ChangelogVersion {
    version: string;
    date: string;
    content: string;
}

export default function ChangelogPage() {
    const [versions, setVersions] = useState<ChangelogVersion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/changelog')
            .then(res => res.json())
            .then(data => {
                setVersions(data.versions || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load changelog:', err);
                setLoading(false);
            });
    }, []);

    const getVersionBadge = (version: string) => {
        if (version.includes('0.')) return { text: 'Beta', color: 'bg-muted' };
        return { text: 'Stable', color: 'bg-primary' };
    };

    const parseMarkdownToSections = (content: string) => {
        const lines = content.split('\n');
        const sections: { title: string; items: string[] }[] = [];
        let currentSection: { title: string; items: string[] } | null = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Section headers (### )
            if (trimmed.startsWith('###')) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    title: trimmed.replace(/^###\s*/, ''),
                    items: []
                };
            }
            // List items (- )
            else if (trimmed.startsWith('-') && currentSection) {
                currentSection.items.push(trimmed.replace(/^-\s*/, ''));
            }
        }

        if (currentSection) sections.push(currentSection);
        return sections;
    };

    const getIconForSection = (title: string) => {
        if (title.includes('✨') || title.includes('New Features')) return Sparkles;
        if (title.includes('🐛') || title.includes('Bug Fixes')) return Bug;
        if (title.includes('⚡') || title.includes('Performance')) return Zap;
        if (title.includes('🔧') || title.includes('Technical')) return Wrench;
        return Sparkles;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-72px)] overflow-hidden bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-72px)] overflow-hidden bg-background">
            <div className="container max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
                {/* Header */}
                <div className="mb-6 shrink-0 flex items-center gap-4">
                    <Link href="/home">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">Changelog</h1>
                        <p className="text-muted-foreground">Track all updates and improvements to Liorea</p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <div className="h-full overflow-y-auto p-6">
                        {/* Timeline */}
                        <div className="relative space-y-8">
                            {/* Vertical line */}
                            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border"></div>

                            {versions.map((versionData, idx) => {
                                const badge = getVersionBadge(versionData.version);
                                const sections = parseMarkdownToSections(versionData.content);

                                return (
                                    <div key={versionData.version} className="relative pl-12">
                                        {/* Version badge */}
                                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm z-10">
                                            {idx + 1}
                                        </div>

                                        <Card className="p-6 bg-card border-border">
                                            {/* Version header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-bold text-foreground">
                                                        v{versionData.version}
                                                    </h2>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${badge.color} text-primary-foreground`}>
                                                        {badge.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {versionData.date}
                                                </div>
                                            </div>

                                            {/* Sections */}
                                            <div className="space-y-4">
                                                {sections.map((section, sIdx) => {
                                                    const Icon = getIconForSection(section.title);
                                                    return (
                                                        <div key={sIdx}>
                                                            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                <Icon className="w-5 h-5" />
                                                                {section.title}
                                                            </h3>
                                                            <ul className="space-y-1.5 ml-7">
                                                                {section.items.map((item, iIdx) => (
                                                                    <li key={iIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                        <span className="text-primary mt-1">•</span>
                                                                        <span dangerouslySetInnerHTML={{
                                                                            __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                                                                        }} />
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
