"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { usePresence } from '@/features/study';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
import { useAuthToken } from '@/hooks/useAuthToken';

type Journal = {
  id: number;
  username: string;
  title: string;
  last_updated: number;
};

export default function JournalManagement() {
  const { username } = usePresence();
  const { token } = useAuthToken();
  const { toast } = useToast();
  const [journals, setJournals] = useState<Journal[]>([]);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/journals/list`);
      if (res.ok) setJournals(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to force delete this journal?")) return;
    if (!username) return;

    try {
      const res = await fetch(`${WORKER_URL}/journals/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ id, username }),
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });

      if (res.ok) {
        toast({ title: "Journal Deleted" });
        fetchJournals();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed (Are you admin?)" });
      }
    } catch (e) { console.error(e); }
  };

  return (
    <Card className="bg-black/10 backdrop-blur-md border border-white/20 text-white mt-8">
      <CardHeader>
        <CardTitle>Journal Moderation</CardTitle>
        <CardDescription>Manage community journals and content.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/20">
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => (
              <TableRow key={journal.id} className="hover:bg-muted/50 border-white/20">
                <TableCell className="font-medium">{journal.title}</TableCell>
                <TableCell>@{journal.username}</TableCell>
                <TableCell>{new Date(journal.last_updated).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(journal.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}