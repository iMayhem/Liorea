// src/app/insights/page.tsx
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function InsightsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading flex items-center gap-2">
                            <BarChart3 className="h-6 w-6" />
                            Insights
                        </CardTitle>
                        <CardDescription>Detailed analytics are currently under maintenance as we upgrade the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Check back later for your study stats!</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}