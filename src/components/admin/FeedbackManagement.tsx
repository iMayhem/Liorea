"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Bug, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FeedbackItem = {
    id: string;
    reporter: string;
    message: string;
    timestamp: number;
    type: 'bug_or_suggestion';
    status: 'open' | 'closed';
};

export default function FeedbackManagement() {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const feedbackRef = ref(db, 'feedback');
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([key, val]: [string, any]) => ({
                    id: key,
                    ...val
                }));
                // Sort by newst first
                list.sort((a, b) => b.timestamp - a.timestamp);
                setFeedback(list);
            } else {
                setFeedback([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkAsClosed = async (id: string) => {
        try {
            await update(ref(db, `feedback/${id}`), { status: 'closed' });
            toast({ title: "Marked as closed" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update status." });
        }
    };

    return (
        <Card className="bg-[#1e1f22]/50 border-zinc-800">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Feedback & Bugs</CardTitle>
                        <CardDescription>Review reports submitted by users.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-black/20">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-[150px]">Reporter</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="w-[150px]">Time</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                        Loading reports...
                                    </TableCell>
                                </TableRow>
                            ) : feedback.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        No feedback found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                feedback.map((item) => (
                                    <TableRow key={item.id} className="border-zinc-800 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">
                                            {item.reporter}
                                        </TableCell>
                                        <TableCell className="text-zinc-300 max-w-md truncate" title={item.message}>
                                            {item.message}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-xs">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === 'open' ? 'destructive' : 'secondary'} className={item.status === 'open' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}>
                                                {item.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status === 'open' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsClosed(item.id)}
                                                    className="hover:bg-green-500/20 hover:text-green-500 h-8 w-8 p-0"
                                                    title="Mark as Closed"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
