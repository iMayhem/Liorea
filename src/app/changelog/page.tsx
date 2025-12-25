"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bug, Zap, Wrench, FileText, Calendar } from "lucide-react";

const versions = [
    {
        version: "1.0.0",
        date: "December 25, 2025",
        badge: "Stable Release",
        badgeColor: "bg-primary",
        changes: [
            { type: "feature", icon: Sparkles, text: "Multiple Reactions: Add multiple emoji reactions to messages" },
            { type: "feature", icon: Sparkles, text: "Smart Emoji Picker: 48 curated emojis with frequency tracking" },
            { type: "feature", icon: Sparkles, text: "Sound Effects: Subtle UI sounds for better feedback" },
            { type: "feature", icon: Sparkles, text: "Multi-Timeframe Leaderboards: Daily, Weekly, and All-Time views" },
            { type: "feature", icon: Sparkles, text: "Focus Mode Indicator: See when users are in focus mode" },
            { type: "feature", icon: Sparkles, text: "Screen Sharing: Share your screen with study partners" },
            { type: "fix", icon: Bug, text: "Fixed chat scroll jumping when adding reactions" },
            { type: "fix", icon: Bug, text: "Fixed notification sounds playing on page load" },
            { type: "fix", icon: Bug, text: "Fixed notification read status not persisting" },
            { type: "perf", icon: Zap, text: "60-70% reduction in Firestore reads" },
            { type: "perf", icon: Zap, text: "Optimized message loading (100 → 50 messages)" },
            { type: "tech", icon: Wrench, text: "Migrated chat system to Firestore" },
            { type: "tech", icon: Wrench, text: "Implemented optimistic UI updates" },
        ]
    },
    {
        version: "0.1.0",
        date: "Beta Releases",
        badge: "Beta",
        badgeColor: "bg-muted",
        changes: [
            { type: "feature", icon: Sparkles, text: "Initial study together functionality" },
            { type: "feature", icon: Sparkles, text: "Basic chat system" },
            { type: "feature", icon: Sparkles, text: "User presence tracking" },
            { type: "feature", icon: Sparkles, text: "Daily leaderboard" },
            { type: "feature", icon: Sparkles, text: "Journal feature" },
            { type: "feature", icon: Sparkles, text: "Admin panel" },
        ]
    }
];

export default function ChangelogPage() {
    return (
        <div className="h-[calc(100vh-72px)] overflow-hidden bg-background">
            <div className="container max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
                {/* Header */}
                <div className="mb-6 shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Versions</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">Track all updates and improvements to Liorea</p>
                </div>

                {/* Scrollable Panel */}
                <div className="flex-1 overflow-hidden rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <div className="h-full overflow-y-auto p-6">
                        {/* Timeline */}
                        <div className="relative pb-8">
                            {/* Vertical line */}
                            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-border" />

                            {/* Version items */}
                            <div className="space-y-8">
                                {versions.map((version, vIdx) => (
                                    <div key={version.version} className="relative">
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 top-2 w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>

                                        {/* Content card */}
                                        <div className="ml-16">
                                            <Card className="p-5 hover:shadow-lg transition-shadow">
                                                {/* Version header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h2 className="text-xl font-bold">Version {version.version}</h2>
                                                            <Badge className={version.badgeColor}>{version.badge}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span>{version.date}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Changes list */}
                                                <div className="space-y-2.5">
                                                    {version.changes.map((change, idx) => {
                                                        const Icon = change.icon;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-3 group">
                                                                <div className={`
                                  w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5
                                  ${change.type === 'feature' ? 'bg-primary/10 text-primary' : ''}
                                  ${change.type === 'fix' ? 'bg-destructive/10 text-destructive' : ''}
                                  ${change.type === 'perf' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                                  ${change.type === 'tech' ? 'bg-blue-500/10 text-blue-500' : ''}
                                `}>
                                                                    <Icon className="w-4 h-4" />
                                                                </div>
                                                                <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                                                                    {change.text}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
