import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Star } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { JournalCollage } from './JournalCollage';
import { Journal } from '../types';

interface JournalCardProps {
    journal: Journal;
    isActive: boolean;
    isFollowed: boolean;
    isOwner: boolean;
    onClick: () => void;
    onUploadClick: (e: React.MouseEvent) => void;
    onDeleteClick: (e: React.MouseEvent) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
    journal,
    isActive,
    isFollowed,
    isOwner,
    onClick,
    onUploadClick,
    onDeleteClick
}) => {
    return (
        <Card
            onClick={onClick}
            // Applied Premium Glass Effect to CARDS INDIVIDUALLY
            className={`relative group cursor-pointer h-40 xl:h-48 glass-panel hover:bg-black/50 transition-all overflow-hidden shadow-lg rounded-xl 
            ${isActive ? 'border-accent/50 ring-1 ring-accent/20' : 'border-white/10'}
            ${isFollowed ? 'shadow-accent/5 border-l-2 border-l-accent' : ''} 
            `}
        >
            <div className="absolute inset-0 z-0"><JournalCollage imagesStr={journal.images} /></div>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
            {isOwner && (
                <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-black/50 hover:bg-white text-white hover:text-black" onClick={onUploadClick}>
                        <Upload className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full bg-red-500/50 hover:bg-red-500" onClick={onDeleteClick}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            )}
            <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1">
                    <UserAvatar username={journal.username} className="h-6 w-6 border border-white/20" />
                    <span className="text-[10px] text-white/60 truncate">@{journal.username}</span>
                    {isFollowed && <Star className="w-3 h-3 text-accent fill-accent" />}
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
};
