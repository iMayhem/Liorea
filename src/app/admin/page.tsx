// src/app/admin/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/header';
import { Loader2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Report } from '@/lib/types';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ReportWithId extends Report {
    id: string;
}


export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [reports, setReports] = React.useState<ReportWithId[]>([]);
    const [loadingReports, setLoadingReports] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        if(!isAuthenticated) return;

        setLoadingReports(true);
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReports: ReportWithId[] = [];
            snapshot.forEach((doc) => {
                fetchedReports.push({ id: doc.id, ...doc.data() } as ReportWithId);
            });
            setReports(fetchedReports);
            setLoadingReports(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // In a real app, this would be a secure API call.
        if (username === 'sujeet' && password === 'Stm@2003#') {
            setIsAuthenticated(true);
        } else {
            toast({
                title: 'Login Failed',
                description: 'Invalid username or password.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Admin Login</CardTitle>
                            <CardDescription>Enter credentials to access the admin panel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }


    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="text-3xl font-bold font-heading mb-6">Admin Panel</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>User Reports</CardTitle>
                        <CardDescription>Issues and suggestions submitted by users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingReports ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : reports.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {reports.map(report => (
                                    <AccordionItem value={report.id} key={report.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <span>{report.title}</span>
                                                <span className="text-sm text-muted-foreground">{new Date(report.timestamp.seconds * 1000).toLocaleString()}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <p><strong className="font-semibold">From:</strong> {report.username}</p>
                                            <p className="whitespace-pre-wrap"><strong className="font-semibold">Description:</strong> {report.description}</p>
                                            {report.imageUrl && (
                                                <div>
                                                    <strong className="font-semibold">Attached Image:</strong>
                                                    <div className="mt-2 relative w-full h-96">
                                                        <Image src={report.imageUrl} alt="User report image" fill style={{objectFit: 'contain'}} />
                                                    </div>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-muted-foreground text-center">No reports found.</p>
                        )}
                    </CardContent>
                </Card>
                 {/* Placeholder for future admin features */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <Card className="opacity-50">
                        <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Coming soon...</p></CardContent>
                    </Card>
                     <Card className="opacity-50">
                        <CardHeader><CardTitle>Room Management</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Coming soon...</p></CardContent>
                    </Card>
                     <Card className="opacity-50">
                        <CardHeader><CardTitle>Leaderboard Tools</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Coming soon...</p></CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
