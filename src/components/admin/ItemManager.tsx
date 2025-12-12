"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ShopItem } from "@/features/gamification/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LottiePreview } from "@/components/ui/LottiePreview";

export default function ItemManager() {
    const { toast } = useToast();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newItem, setNewItem] = useState<Partial<ShopItem>>({ type: 'badge', price: 0 });
    const [file, setFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await api.gamification.getItems();
            setItems(data || []);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Failed to load items" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (fileToUpload: File) => {
        const { url } = await api.upload.put(fileToUpload);
        return url;
    };

    const handleCreate = async () => {
        if (!newItem.name || !newItem.price || !newItem.id) {
            toast({ variant: "destructive", title: "Missing fields" });
            return;
        }

        setUploading(true);
        try {
            let assetUrl = newItem.assetUrl || "";
            let previewUrl = newItem.previewUrl || "";

            if (file) {
                assetUrl = await handleFileUpload(file);
            }
            // For badges, the preview is often an emoji or same as asset. For frames, preview might be different?
            // If previewFile is provided, upload it.
            if (previewFile) {
                previewUrl = await handleFileUpload(previewFile);
            }

            const itemPayload: ShopItem = {
                id: newItem.id,
                name: newItem.name,
                description: newItem.description || "",
                price: Number(newItem.price),
                type: newItem.type as any,
                assetUrl,
                previewUrl: previewUrl || (newItem.type === 'badge' ? "📦" : "") // Fallback
            };

            await api.gamification.admin.createItem(itemPayload);
            toast({ title: "Item Created!" });
            setNewItem({ type: 'badge', price: 0, id: '', name: '', description: '' });
            setFile(null);
            setPreviewFile(null);
            loadItems();
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Failed to create item" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.gamification.admin.deleteItem(id);
            toast({ title: "Item deleted" });
            loadItems();
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    const handleInitDB = async () => {
        try {
            await api.gamification.admin.init();
            toast({ title: "Database Initialized" });
        } catch (e) {
            toast({ variant: "destructive", title: "Init Failed", description: String(e) });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Shop Item Manager</h2>
                <Button variant="outline" onClick={handleInitDB} className="text-xs h-7">Run DB Init</Button>
            </div>

            {/* CREATE PANEL */}
            <Card className="bg-[#1e1f22] border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider text-zinc-400">Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            placeholder="Item ID (e.g. badge_cool)"
                            value={newItem.id || ''}
                            onChange={e => setNewItem({ ...newItem, id: e.target.value })}
                            className="bg-zinc-900 border-zinc-700"
                        />
                        <Input
                            placeholder="Display Name"
                            value={newItem.name || ''}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            className="bg-zinc-900 border-zinc-700"
                        />
                        <Input
                            placeholder="Description"
                            value={newItem.description || ''}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            className="bg-zinc-900 border-zinc-700"
                        />
                        <Input
                            type="number"
                            placeholder="Price"
                            value={newItem.price || ''}
                            onChange={e => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                            className="bg-zinc-900 border-zinc-700"
                        />

                        <Select
                            value={newItem.type}
                            onValueChange={(v: any) => setNewItem({ ...newItem, type: v })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="badge">Badge</SelectItem>
                                <SelectItem value="frame">Frame</SelectItem>
                                <SelectItem value="effect">Effect</SelectItem>
                                <SelectItem value="color">Color</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500">Main Asset (Image/APNG)</label>
                            <Input
                                type="file"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="bg-zinc-900 border-zinc-700 cursor-pointer text-xs"
                            />
                        </div>
                    </div>

                    <Button onClick={handleCreate} disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {uploading ? 'Uploading & Creating...' : 'Create Item'}
                    </Button>
                </CardContent>
            </Card>

            {/* LIST */}
            <Card className="bg-[#1e1f22] border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider text-zinc-400">Inventory Database</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-500">Preview</TableHead>
                                <TableHead className="text-zinc-500">Name</TableHead>
                                <TableHead className="text-zinc-500">Type</TableHead>
                                <TableHead className="text-zinc-500">Price</TableHead>
                                <TableHead className="text-zinc-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                                        No items in database yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {items.map(item => (
                                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell>
                                        {item.type === 'effect' && item.assetUrl ? (
                                            <LottiePreview url={item.assetUrl} className="w-8 h-8" />
                                        ) : item.assetUrl ? (
                                            <img src={item.assetUrl} className="w-8 h-8 object-contain" alt="" />
                                        ) : (
                                            <span className="text-xl">{item.previewUrl || '📦'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-zinc-200">
                                        {item.name}
                                        <div className="text-[10px] text-zinc-500">{item.id}</div>
                                    </TableCell>
                                    <TableCell className="capitalize text-zinc-400">{item.type}</TableCell>
                                    <TableCell className="text-zinc-400">{item.price} 🟡</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
