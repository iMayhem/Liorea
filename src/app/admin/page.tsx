'use client';

import * as React from 'react';
import { AppHeader } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Check, Trash2, Plus, Image as ImageIcon, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Background } from '@/lib/types';
import Image from 'next/image';

// Simple hardcoded password. Change this to whatever you want!
const ADMIN_PASSWORD = "admin"; 

export default function AdminPage() {
    const [password, setPassword] = React.useState('');
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [backgrounds, setBackgrounds] = React.useState<Background[]>([]);
    const [newUrl, setNewUrl] = React.useState('');
    const [newName, setNewName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    // Fetch backgrounds on load
    const fetchBackgrounds = async () => {
        const { data } = await supabase.from('backgrounds').select('*').order('created_at', { ascending: false });
        if (data) setBackgrounds(data as any);
    };

    React.useEffect(() => {
        if (isAuthenticated) fetchBackgrounds();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            toast({ title: "Access Granted", description: "Welcome, Admin." });
        } else {
            toast({ title: "Access Denied", description: "Wrong password.", variant: "destructive" });
        }
    };

    const handleSetActive = async (id: string) => {
        setLoading(true);
        // 1. Set all to false
        await supabase.from('backgrounds').update({ is_active: false }).neq('id', '0');
        // 2. Set selected to true
        await supabase.from('backgrounds').update({ is_active: true }).eq('id', id);
        
        await fetchBackgrounds();
        setLoading(false);
        toast({ title: "Background Updated", description: "All users will see this shortly." });
    };

    const handleAddBackground = async () => {
        if (!newUrl) return;
        setLoading(true);
        const { error } = await supabase.from('backgrounds').insert({
            url: newUrl,
            name: newName || 'Untitled',
            is_active: false
        });
        
        if (error) {
            toast({ title: "Error", description: "Could not add image.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Image added to library." });
            setNewUrl('');
            setNewName('');
            fetchBackgrounds();
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Are you sure?")) return;
        await supabase.from('backgrounds').delete().eq('id', id);
        fetchBackgrounds();
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Admin Access</CardTitle>
                            <CardDescription>Enter password to continue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <Button type="submit" className="w-full">Unlock</Button>
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
            <main className="container mx-auto p-4 md:p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-heading">Global Appearance</h1>
                    <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Logout</Button>
                </div>

                {/* Add New Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Background</CardTitle>
                        <CardDescription>Paste an Image URL (Unsplash, Imgur, etc.)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4 flex-col md:flex-row">
                        <Input 
                            placeholder="Image Name (e.g. Deep Space)" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            className="md:w-1/3"
                        />
                        <Input 
                            placeholder="Image URL (https://...)" 
                            value={newUrl} 
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="md:flex-1"
                        />
                        <Button onClick={handleAddBackground} disabled={loading || !newUrl}>
                            <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </CardContent>
                </Card>

                {/* List Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {backgrounds.map((bg) => (
                        <Card key={bg.id} className={`overflow-hidden transition-all ${bg.isActive ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''}`}>
                            <div className="relative h-40 w-full bg-muted">
                                <Image 
                                    src={bg.url} 
                                    alt={bg.name} 
                                    fill 
                                    className="object-cover"
                                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Error")}
                                />
                                {bg.isActive && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                                            <Check className="mr-1 h-3 w-3" /> Active
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold truncate">{bg.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        className="flex-1" 
                                        variant={bg.isActive ? "secondary" : "default"}
                                        onClick={() => handleSetActive(bg.id)}
                                        disabled={loading || bg.isActive}
                                    >
                                        {bg.isActive ? "Current" : "Set Active"}
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon"
                                        onClick={() => handleDelete(bg.id)}
                                        disabled={bg.isActive} // Prevent deleting active bg
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}