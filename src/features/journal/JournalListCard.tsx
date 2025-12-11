"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Star } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { cn } from '@/lib/utils';

interface Journal {
  id: number;
  username: string;
  title: string;
  tags: string;
  images?: string;
  last_updated: number;
}

interface JournalListCardProps {
  journal: Journal;
  isActive: boolean;
  isFollowing: boolean;
  isOwner: boolean;
  onClick: () => void;
  onUpload: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

// Helper: The 2x2 Image Grid
const JournalCollage = ({ imagesStr }: { imagesStr?: string }) => {
  const images = imagesStr ? imagesStr.split(',').filter(Boolean) : [];
  if (images.length === 0) return <div className="w-full h-full bg-black/40" />;
  
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      <div className={cn("relative overflow-hidden border-r border-b border-black/10", 
        images.length === 1 && "col-span-2 row-span-2",
        images.length === 3 && "row-span-2"
      )}>
        <img src={images[0]} className="w-full h-full object-cover" loading="lazy" />
      </div>
      {images.length >= 2 && (
        <div className={cn("relative overflow-hidden border-b border-black/10", images.length === 2 && "row-span-2")}>
          <img src={images[1]} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      {images.length >= 3 && (
        <div className={cn("relative overflow-hidden border-r border-black/10", images.length === 3 && "col-start-2")}>
          <img src={images[2]} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      {images.length >= 4 && (
        <div className="relative overflow-hidden">
          <img src={images[3]} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
    </div>
  );
};

export default function JournalListCard({ 
  journal, isActive, isFollowing, isOwner, onClick, onUpload, onDelete 
}: JournalListCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer h-40 xl:h-48 overflow-hidden shadow-lg transition-all",
        "glass-panel hover:bg-black/50",
        isActive ? 'border-accent/50 ring-1 ring-accent/20' : 'border-white/10',
        isFollowing && 'shadow-accent/5 border-l-2 border-l-accent'
      )}
    >
      {/* Background Images */}
      <div className="absolute inset-0 z-0"><JournalCollage imagesStr={journal.images} /></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      
      {/* Owner Actions (Hover) */}
      {isOwner && (
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-black/50 hover:bg-white text-white hover:text-black" onClick={onUpload}>
            <Upload className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full bg-red-500/50 hover:bg-red-500" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-1">
          <UserAvatar username={journal.username} className="h-6 w-6 border border-white/20" />
          <span className="text-[10px] text-white/60 truncate">@{journal.username}</span>
          {isFollowing && <Star className="w-3 h-3 text-accent fill-accent" />}
        </div>
        <h3 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{journal.title}</h3>
        <div className="flex gap-1 flex-wrap">
          {journal.tags && journal.tags.split(',').slice(0, 1).map((tag, i) => (
            <span key={i} className="text-[9px] bg-white/10 px-1.5 rounded text-white/70">{tag}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}