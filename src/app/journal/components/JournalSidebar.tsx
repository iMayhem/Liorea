import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus } from 'lucide-react';
import { JournalCard } from './JournalCard';
import { Journal } from '../types';

interface JournalSidebarProps {
    sortedJournals: Journal[];
    activeJournal: Journal | null;
    followedIds: number[];
    username: string;
    onOpenJournal: (journal: Journal) => void;
    onUploadClick: (id: number, e: React.MouseEvent) => void;
    onDeleteClick: (id: number) => void;
    // Create Journal Props
    newTitle: string;
    setNewTitle: (s: string) => void;
    newTags: string;
    setNewTags: (s: string) => void;
    onCreateJournal: () => void;
}

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
    sortedJournals,
    activeJournal,
    followedIds,
    username,
    onOpenJournal,
    onUploadClick,
    onDeleteClick,
    newTitle,
    setNewTitle,
    newTags,
    setNewTags,
    onCreateJournal
}) => {
    return (
        <div className={`w-full xl:w-[480px] flex flex-col shrink-0 h-full ${activeJournal ? 'hidden xl:flex' : 'flex'}`}>
            {/* Header */}
            <div className="flex items-center justify-end mb-6">

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-white/90 gap-2 font-medium shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95">
                            <Plus className="w-4 h-4" />
                            New Journal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
                        <DialogHeader>
                            <DialogTitle>Create Journal</DialogTitle>
                            <DialogDescription>Create a new space for your thoughts.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input placeholder="Journal Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Input placeholder="Tags (e.g. NEET)" value={newTags} onChange={e => setNewTags(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                            <Button onClick={onCreateJournal} className="w-full bg-accent text-black hover:bg-white">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {sortedJournals.map((journal) => (
                        <JournalCard
                            key={journal.id}
                            journal={journal}
                            isActive={activeJournal?.id === journal.id}
                            isFollowed={followedIds.includes(journal.id)}
                            isOwner={journal.username === username}
                            onClick={() => onOpenJournal(journal)}
                            onUploadClick={(e) => onUploadClick(journal.id, e)}
                            onDeleteClick={(e) => { e.stopPropagation(); onDeleteClick(journal.id); }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
