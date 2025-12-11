"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/features/ui/GlassCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { usePresence } from '@/context/PresenceContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type Journal = {
  id: number;
  username: string;
  title: string;
  last_updated: number;
};

export default function JournalManagement() {
  const { username } = usePresence();
  const { toast } = useToast();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    setIsLoading(true);
    try {
        const list = await api.journal.list();
        setJournals(list);
    } catch (e) { 
        console.error(e); 
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to force delete this journal?")) return;
      if (!username) return;

      // Note: We need to ensure the DELETE endpoint is supported in api.ts
      // For now, we assume direct fetch or add it to api.ts. 
      // To keep it simple here, we will do a direct safe call since api.ts might not have delete logic explicitly typed yet.
      
      try {
          const res = await fetch("https://r2-gallery-api.sujeetunbeatable.workers.dev/journals/delete", {
              method: 'DELETE',
              body: JSON.stringify({ id, username }),
              headers: { 'Content-Type': 'application/json' }
          });
          
          if (res.ok) {
              toast({ title: "Deleted", description: "Journal removed." });
              loadJournals(); // Refresh list
          } else {
              toast({ variant: "destructive", title: "Error", description: "Could not delete." });
          }
      } catch (e) { console.error(e); }
  };

  return (
    <GlassCard className="flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold">Journal Moderation</h3>
        <p className="text-xs text-white/50">Manage community content</p>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/20">
              <TableHead className="text-white/60">Title</TableHead>
              <TableHead className="text-white/60">Owner</TableHead>
              <TableHead className="text-white/60">Updated</TableHead>
              <TableHead className="text-right text-white/60">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center text-white/40">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : journals.map((journal) => (
              <TableRow key={journal.id} className="hover:bg-white/5 border-white/10">
                <TableCell className="font-medium">{journal.title}</TableCell>
                <TableCell className="text-white/70">@{journal.username}</TableCell>
                <TableCell className="text-white/50 text-xs">{new Date(journal.last_updated).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(journal.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
}