"use client";

import { useState } from 'react';
import { GlassCard } from '@/features/ui/GlassCard';
import { Scrollable } from '@/features/ui/Scrollable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Music, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useBackgrounds } from '@/features/backgrounds/useBackgrounds';
import { useToast } from '@/hooks/use-toast';

export default function BackgroundManagement() {
  const { backgrounds, isLoading: isLoadingList } = useBackgrounds();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      // Reuse our central API logic
      await api.media.upload(file);
      
      toast({ title: "Upload Successful", description: "File added to R2 bucket." });
      // In a real app, we'd trigger a refresh of the list here
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
      // Placeholder for delete logic
      toast({ title: "Not Implemented", description: "Deletion API required." });
  };

  return (
    <GlassCard className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-semibold">Asset Library</h3>
            <p className="text-xs text-white/50">Cloudflare R2 Storage (Backgrounds & Audio)</p>
        </div>
        <div className="relative">
            <input 
                type="file" 
                id="bg-upload" 
                className="hidden" 
                onChange={handleUpload}
                disabled={isUploading}
            />
            <label htmlFor="bg-upload">
                <Button variant="secondary" size="sm" className="cursor-pointer" asChild>
                    <span>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                        Upload
                    </span>
                </Button>
            </label>
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 border border-white/10 rounded-md overflow-hidden relative">
        <Scrollable className="h-full bg-white/5">
            <Table>
            <TableHeader className="bg-[#18181b] sticky top-0 z-10">
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="text-white/60">Filename</TableHead>
                    <TableHead className="text-white/60">Preview</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingList ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-white/40">
                            Loading files...
                        </TableCell>
                    </TableRow>
                ) : backgrounds.map((file) => (
                <TableRow key={file.id} className="border-white/10 hover:bg-white/5 group">
                    <TableCell>
                        {file.id.endsWith('.mp3') ? <Music className="w-4 h-4 text-purple-400"/> : <ImageIcon className="w-4 h-4 text-blue-400"/>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/80">
                        {file.name}
                    </TableCell>
                    <TableCell>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-xs text-accent underline hover:text-white truncate max-w-[200px] block">
                            {file.url}
                        </a>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDelete(file.id)}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </Scrollable>
      </div>
    </GlassCard>
  );
}