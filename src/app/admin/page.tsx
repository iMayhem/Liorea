// src/app/admin/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/header';
import { Loader2, Trash2, LogOut } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Report, UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface ReportWithId extends Report {
    id: string;
}

interface UserManagementProps {
    users: UserProfile[];
    loading: boolean;
}

function UserManagement({ users, loading }: UserManagementProps) {
    const { toast } = useToast();
    const [blockingUid, setBlockingUid] = React.useState<string | null>(null);

    const handleToggleBlock = async (uid: string, isCurrentlyBlocked: boolean) => {
        setBlockingUid(uid);
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { isBlocked: !isCurrentlyBlocked });
            toast({
                title: `User ${isCurrentlyBlocked ? 'Unblocked' : 'Blocked'}`,
                description: `The user has been successfully ${isCurrentlyBlocked ? 'unblocked' : 'blocked'}.`,
            });
        } catch (error) {
            console.error("Failed to update user block status:", error);
            toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
        } finally {
            setBlockingUid(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>{users.length} users found.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : users.map(user => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant={user.isBlocked ? 'secondary' : 'destructive'}
                                            size="sm"
                                            onClick={() => handleToggleBlock(user.uid, !!user.isBlocked)}
                                            disabled={blockingUid === user.uid}
                                        >
                                            {blockingUid === user.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : (user.isBlocked ? 'Unblock' : 'Block')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

interface Room {
    id: string;
    type: 'study' | 'jam';
    participants: any[];
}

interface RoomManagementProps {
    rooms: Room[];
    loading: boolean;
}

function RoomManagement({ rooms, loading }: RoomManagementProps) {
    const { toast } = useToast();
    const [deletingRoomId, setDeletingRoomId] = React.useState<string | null>(null);

    const handleDeleteRoom = async (roomId: string, type: 'study' | 'jam') => {
        setDeletingRoomId(roomId);
        try {
            const collectionName = type === 'study' ? 'studyRooms' : 'jamRooms';
            const roomRef = doc(db, collectionName, roomId);
            
            // Delete subcollections (like chats) first
            const chatCollectionRef = collection(db, collectionName, roomId, 'chats');
            const chatSnapshot = await getDocs(chatCollectionRef);
            const deletePromises = chatSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Delete the room document itself
            await deleteDoc(roomRef);

            toast({
                title: "Room Deleted",
                description: `The ${type} room has been successfully deleted.`,
            });
        } catch (error) {
            console.error("Error deleting room:", error);
            toast({
                title: 'Error',
                description: 'Could not delete the room. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setDeletingRoomId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Room Management</CardTitle>
                <CardDescription>{rooms.length} active rooms.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : rooms.map(room => (
                                <TableRow key={room.id}>
                                    <TableCell className="font-mono text-xs truncate max-w-[100px]">{room.id}</TableCell>
                                    <TableCell className="capitalize">{room.type}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" disabled={deletingRoomId === room.id}>
                                                    {deletingRoomId === room.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Room?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the room and its chat history. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteRoom(room.id, room.type)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function LeaderboardTools() {
    const { toast } = useToast();
    const [isResetting, setIsResetting] = React.useState(false);

    const handleResetLeaderboard = async () => {
        setIsResetting(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const studyLogsSnapshot = await getDocs(collection(db, 'studyLogs'));
            const batch = writeBatch(db);

            // Reset totalStudyHours for all users
            usersSnapshot.forEach(userDoc => {
                batch.update(userDoc.ref, { totalStudyHours: 0 });
            });
            
            // Delete all studyLogs documents
            studyLogsSnapshot.forEach(logDoc => {
                batch.delete(logDoc.ref);
            });

            await batch.commit();

            toast({ title: "Leaderboard Reset", description: "All user study times have been reset." });

        } catch (error) {
            console.error("Failed to reset leaderboard:", error);
            toast({ title: "Error", description: "Could not reset the leaderboard.", variant: "destructive" });
        } finally {
            setIsResetting(false);
        }
    };


    return (
         <Card>
            <CardHeader><CardTitle>Leaderboard Tools</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Use these tools to manage the global leaderboard.</p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isResetting}>
                            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Reset All Study Time
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all study logs and reset total study time for every user to zero.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetLeaderboard}>Yes, reset leaderboard</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardContent>
        </Card>
    );
}

function ChatManagement() {
    const { toast } = useToast();
    const [isClearingStudy, setIsClearingStudy] = React.useState(false);
    const [isClearingJam, setIsClearingJam] = React.useState(false);

    const handleClearAllChats = async (type: 'study' | 'jam') => {
        const setIsClearing = type === 'study' ? setIsClearingStudy : setIsClearingJam;
        setIsClearing(true);
        
        const collectionName = type === 'study' ? 'studyRooms' : 'jamRooms';
        
        try {
            const roomsSnapshot = await getDocs(collection(db, collectionName));
            
            for (const roomDoc of roomsSnapshot.docs) {
                const batch = writeBatch(db);
                const chatCollectionRef = collection(db, collectionName, roomDoc.id, 'chats');
                const chatSnapshot = await getDocs(chatCollectionRef);
                
                if (chatSnapshot.empty) continue;
                
                chatSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                await batch.commit();
            }

            toast({ title: `All ${type} chats cleared`, description: `All chat messages in ${collectionName} have been deleted.` });

        } catch (error) {
            console.error(`Failed to clear ${type} chats:`, error);
            toast({ title: "Error", description: `Could not clear ${type} chats.`, variant: "destructive" });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chat Management</CardTitle>
                <CardDescription>Permanently delete all chat messages from all rooms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={isClearingStudy}>
                            {isClearingStudy ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                            Clear All Study Room Chats
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all chat messages from every single Study Room. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleClearAllChats('study')}>Yes, clear study chats</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full" disabled={isClearingJam}>
                            {isClearingJam ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                            Clear All Jamnight Chats
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all chat messages from every single Jamnight Room. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleClearAllChats('jam')}>Yes, clear jamnight chats</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

function GlobalUserEviction() {
    const { toast } = useToast();
    const [isEvicting, setIsEvicting] = React.useState(false);

    const handleEvictAllUsers = async () => {
        setIsEvicting(true);
        try {
            const batch = writeBatch(db);

            // Clear participants from all study rooms
            const studyRoomsSnapshot = await getDocs(collection(db, 'studyRooms'));
            studyRoomsSnapshot.forEach(roomDoc => {
                batch.update(roomDoc.ref, { participants: [], typingUsers: {} });
            });

            // Clear participants from all jam rooms
            const jamRoomsSnapshot = await getDocs(collection(db, 'jamRooms'));
            jamRoomsSnapshot.forEach(roomDoc => {
                batch.update(roomDoc.ref, { participants: [], typingUsers: {} });
            });

            // Reset status for all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            usersSnapshot.forEach(userDoc => {
                batch.update(userDoc.ref, { status: { isStudying: false, isJamming: false, roomId: null } });
            });

            await batch.commit();

            toast({ title: "All Users Evicted", description: "All users have been removed from rooms and their statuses have been reset." });

        } catch (error) {
            console.error("Failed to evict all users:", error);
            toast({ title: "Error", description: "Could not evict all users from rooms.", variant: "destructive" });
        } finally {
            setIsEvicting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Global Room Tools</CardTitle>
                <CardDescription>Use with caution. These actions affect all users.</CardDescription>
            </CardHeader>
            <CardContent>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={isEvicting}>
                            {isEvicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4"/>}
                            Evict All Users from Rooms
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove every user from every study and jamnight room and reset their online status. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEvictAllUsers}>Yes, evict everyone</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [reports, setReports] = React.useState<ReportWithId[]>([]);
    const [loadingReports, setLoadingReports] = React.useState(true);
    const [users, setUsers] = React.useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = React.useState(true);
    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        if(!isAuthenticated) return;

        // Reports Listener
        setLoadingReports(true);
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribeReports = onSnapshot(q, (snapshot) => {
            const fetchedReports: ReportWithId[] = [];
            snapshot.forEach((doc) => {
                fetchedReports.push({ id: doc.id, ...doc.data() } as ReportWithId);
            });
            setReports(fetchedReports);
            setLoadingReports(false);
        });

        // Users listener
        setLoadingUsers(true);
        const usersQuery = query(collection(db, 'users'), orderBy('username'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(doc => {
                fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            setUsers(fetchedUsers);
            setLoadingUsers(false);
        });

        // Rooms listener
        setLoadingRooms(true);
        const studyRoomsQuery = collection(db, 'studyRooms');
        const jamRoomsQuery = collection(db, 'jamRooms');

        const unsubscribeStudyRooms = onSnapshot(studyRoomsQuery, (snapshot) => {
            const studyRooms = snapshot.docs.map(doc => ({ id: doc.id, type: 'study' as const, participants: doc.data().participants || []}));
            setRooms(prev => [...studyRooms, ...prev.filter(r => r.type !== 'study')]);
            setLoadingRooms(false);
        }, () => setLoadingRooms(false));

        const unsubscribeJamRooms = onSnapshot(jamRoomsQuery, (snapshot) => {
            const jamRooms = snapshot.docs.map(doc => ({ id: doc.id, type: 'jam' as const, participants: doc.data().participants || []}));
            setRooms(prev => [...jamRooms, ...prev.filter(r => r.type !== 'jam')]);
            setLoadingRooms(false);
        }, () => setLoadingRooms(false));


        return () => {
            unsubscribeReports();
            unsubscribeUsers();
            unsubscribeStudyRooms();
            unsubscribeJamRooms();
        };
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                   <UserManagement users={users} loading={loadingUsers} />
                   <RoomManagement rooms={rooms} loading={loadingRooms}/>
                   <LeaderboardTools />
                   <ChatManagement />
                   <GlobalUserEviction />
                </div>
                
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
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
                                                <span className="text-sm text-muted-foreground">{report.timestamp?.seconds ? new Date(report.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <p><strong className="font-semibold">From:</strong> {report.username}</p>
                                            <p className="whitespace-pre-wrap"><strong className="font-semibold">Description:</strong> {report.description}</p>
                                            {report.imageUrl && (
                                                <div className="mt-2">
                                                    <p><strong className="font-semibold">Attachment:</strong></p>
                                                    <Image src={report.imageUrl} alt="Report attachment" width={300} height={200} className="rounded-md border mt-1" />
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
            </main>
        </div>
    );
}
