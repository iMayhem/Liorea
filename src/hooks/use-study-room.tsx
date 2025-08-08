// src/hooks/use-study-room.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, arrayUnion, arrayRemove, writeBatch, getDocs, deleteField, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimerState, ChatMessage, Participant, SoundType, Notepads } from '@/lib/types';
import { logStudySession, updateUserProfile } from '@/lib/firestore';
import { useToast } from './use-toast';
import { usePathname, useRouter } from 'next/navigation';

interface StudyRoomContextType {
    currentRoomId: string | null;
    roomData: DocumentData | null;
    chatMessages: ChatMessage[];
    participants: Participant[];
    displayTime: number;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    isMuted: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
    userHasLeftRef: React.MutableRefObject<boolean>;
    isFocusMode: boolean;
    setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
    joinRoom: (roomId: string) => Promise<boolean>;
    leaveRoom: () => void;
    handleTimerUpdate: (newState: Partial<TimerState>) => void;
    handleNotepadChange: (content: string) => void;
    handleSendMessage: (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => void;
    handleTyping: (isTyping: boolean) => void;
    activeSound: SoundType;
    handleSoundChange: (sound: SoundType) => void;
    notepads: Notepads;
    activeNotepad: string;
    setActiveNotepad: React.Dispatch<React.SetStateAction<string>>;
}

const StudyRoomContext = createContext<StudyRoomContextType | undefined>(undefined);

const TIME_LOG_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function StudyRoomProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<DocumentData | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [displayTime, setDisplayTime] = useState(0);
    const [volume, setVolume] = React.useState(0.5);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFocusMode, setIsFocusMode] = React.useState(false);

    // Notepad state
    const [notepads, setNotepads] = useState<Notepads>({ collaborative: '' });
    const [activeNotepad, setActiveNotepad] = useState<string>('collaborative');

    const activeSound = roomData?.activeSound || 'none';


    const unsubscribeRoomRef = useRef<() => void | undefined>();
    const unsubscribeChatRef = useRef<() => void | undefined>();
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const logTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const userHasLeftRef = useRef(false);
    const isInitialJoinRef = useRef(true);

    useEffect(() => {
        if(user && activeNotepad === 'collaborative') {
            setActiveNotepad(user.uid);
        } else if(!user) {
            setActiveNotepad('collaborative');
        }
    }, [user, activeNotepad]);


    // Effect to play sounds on participant changes
    useEffect(() => {
        if (isInitialJoinRef.current || !currentRoomId) {
            isInitialJoinRef.current = false;
            return;
        }

        const playSound = (soundId: string) => {
            const sound = document.getElementById(soundId) as HTMLAudioElement;
            if (sound) {
                sound.play().catch(error => {
                    // Ignore errors from being interrupted by a pause call.
                    if (error.name !== 'AbortError') {
                        console.error(`Error playing ${soundId}:`, error)
                    }
                });
            }
        };

        const prevParticipants = JSON.parse(sessionStorage.getItem(`participants-${currentRoomId}`) || '[]');
        if (participants.length > prevParticipants.length) {
            playSound('join-sound');
        } else if (participants.length < prevParticipants.length) {
            playSound('leave-sound');
        }
        sessionStorage.setItem(`participants-${currentRoomId}`, JSON.stringify(participants));

    }, [participants, currentRoomId]);

    const cleanupListeners = useCallback(() => {
        if (unsubscribeRoomRef.current) unsubscribeRoomRef.current();
        if (unsubscribeChatRef.current) unsubscribeChatRef.current();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (logTimeIntervalRef.current) clearInterval(logTimeIntervalRef.current);
        unsubscribeRoomRef.current = undefined;
        unsubscribeChatRef.current = undefined;
        timerIntervalRef.current = null;
        logTimeIntervalRef.current = null;
    }, []);

    const leaveRoom = useCallback(async () => {
        if (!user || !currentRoomId) return;
        userHasLeftRef.current = true;
        
        const leavingRoomId = currentRoomId;
        const wasInRoomPage = pathname.includes(`/study-together/${leavingRoomId}`);
        
        // Update user status first
        await updateUserProfile(user.uid, { status: { isStudying: false, roomId: null }});

        // Clean up local state and listeners *before* Firestore operations
        cleanupListeners();
        setCurrentRoomId(null);
        setRoomData(null);
        setChatMessages([]);
        setParticipants([]);
        setIsFocusMode(false); // Ensure focus mode is turned off when leaving

         if (wasInRoomPage) {
            router.push('/study-together');
        }
        
        const roomRef = doc(db, 'studyRooms', leavingRoomId);
        try {
            const roomSnap = await getDoc(roomRef);
            if (!roomSnap.exists()) {
                console.log("Room already deleted, skipping cleanup.");
                return; 
            }
            
            const currentParticipants = roomSnap.data()?.participants || [];
            if (currentParticipants.length <= 1 && currentParticipants.some((p: Participant) => p.uid === user.uid)) {
                // If this is the last user, delete the room and its subcollection
                const chatRef = collection(db, 'studyRooms', leavingRoomId, 'chats');
                const chatSnapshot = await getDocs(chatRef);
                const batch = writeBatch(db);
                chatSnapshot.forEach(doc => batch.delete(doc.ref));
                batch.delete(roomRef);
                await batch.commit();
            } else {
                // If other users are present, just remove this user
                const userParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
                const typingField = `typingUsers.${user.uid}`;
                await updateDoc(roomRef, { 
                    participants: arrayRemove(userParticipant),
                    [typingField]: deleteField(),
                }).catch(err => console.error("Error cleaning up room state:", err));
            }
        } catch (error) {
            if ((error as any).code !== 'not-found') { 
               console.error("Error leaving room:", error);
                toast({ title: "Error", description: "Could not leave the room properly.", variant: "destructive" });
            }
        }
    }, [user, currentRoomId, toast, cleanupListeners, pathname, router]);
    
    // Effect for periodic time logging
    useEffect(() => {
        if (logTimeIntervalRef.current) clearInterval(logTimeIntervalRef.current);

        if (currentRoomId && user) {
            logTimeIntervalRef.current = setInterval(() => {
                logStudySession([user.uid], TIME_LOG_INTERVAL_MS / 1000);
            }, TIME_LOG_INTERVAL_MS);
        }

        return () => {
            if (logTimeIntervalRef.current) clearInterval(logTimeIntervalRef.current);
        }
    }, [currentRoomId, user]);


    const joinRoom = useCallback(async (roomId: string) => {
        userHasLeftRef.current = false;
        if (!user) return false;
        if (currentRoomId === roomId) return true;
        if (currentRoomId && currentRoomId !== roomId) {
            await leaveRoom(); // Leave current room before joining a new one
        }

        isInitialJoinRef.current = true; // Set flag to prevent sound on initial join
        const roomRef = doc(db, 'studyRooms', roomId);
        const docSnap = await getDoc(roomRef);

        if (!docSnap.exists()) {
            return false;
        }
        
        await updateUserProfile(user.uid, { status: { isStudying: true, roomId: roomId }});

        const newParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
        const currentParticipants = docSnap.data().participants || [];
        if(!currentParticipants.some((p: Participant) => p.uid === user.uid)) {
             await updateDoc(roomRef, { participants: arrayUnion(newParticipant) });
        }


        setCurrentRoomId(roomId);
        // Set active notepad to user's own notepad upon joining a room
        setActiveNotepad(user.uid);
        
        unsubscribeRoomRef.current = onSnapshot(roomRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setRoomData(data);
                setParticipants(data.participants || []);
                setNotepads(data.notepads || { collaborative: '' });
            } else {
                cleanupListeners();
                setCurrentRoomId(null);
                 if (!userHasLeftRef.current) {
                    toast({ title: "Room Closed", description: "The study room was deleted.", variant: "destructive" });
                 }
            }
        });

        const chatQuery = query(collection(db, 'studyRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));
        unsubscribeChatRef.current = onSnapshot(chatQuery, (querySnapshot) => {
            const messages: ChatMessage[] = [];
            querySnapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        return true;
    }, [user, currentRoomId, leaveRoom, toast, cleanupListeners]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (currentRoomId) {
                // This is a sync call, so we can't do async cleanup here.
                // We rely on re-joining logic or timeout for cleanup.
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if(currentRoomId) {
                leaveRoom();
            }
        }
    }, [currentRoomId, leaveRoom]);


    // When user logs out or auth state changes
    useEffect(() => {
        if (!user && currentRoomId) {
            leaveRoom();
        }
    }, [user, currentRoomId, leaveRoom]);


    // Timer logic
    const getDuration = (timerState: TimerState) => {
        const { mode, studyDuration, shortBreakDuration, longBreakDuration } = timerState;
        switch(mode) {
            case 'study': return (studyDuration || 25) * 60;
            case 'shortBreak': return (shortBreakDuration || 5) * 60;
            case 'longBreak': return (longBreakDuration || 15) * 60;
            default: return 25 * 60;
        }
    }

    const handleTimerUpdate = useCallback(async (newState: Partial<TimerState>) => {
        if (!roomData || !currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        try {
            await updateDoc(roomRef, { timerState: { ...roomData.timerState, ...newState } });
        } catch (error) {
            if ((error as any).code !== 'not-found') {
                console.error("Failed to update timer state:", error);
            }
        }
    }, [roomData, currentRoomId]);

    useEffect(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        if (roomData?.timerState?.isActive && roomData?.timerState?.startTime) {
            timerIntervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - roomData.timerState.startTime.toMillis()) / 1000);
                const newTime = Math.max(0, getDuration(roomData.timerState) - elapsed);
                setDisplayTime(newTime);
                
                if (newTime === 0) {
                     if (roomData.timerState.mode === 'study') {
                        handleTimerUpdate({ mode: 'shortBreak', time: getDuration({...roomData.timerState, mode: 'shortBreak'}), isActive: false, startTime: null });
                    } else {
                        handleTimerUpdate({ mode: 'study', time: getDuration({...roomData.timerState, mode: 'study'}), isActive: false, startTime: null });
                    }
                }
            }, 1000);
        } else if (roomData?.timerState) {
            setDisplayTime(roomData.timerState.time);
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [roomData, user, participants, handleTimerUpdate]);


    // Other handlers
    const handleNotepadChange = useCallback(async (content: string) => {
        if (!currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const fieldPath = `notepads.${activeNotepad}`;
        try {
            await updateDoc(roomRef, { [fieldPath]: content });
        } catch (error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update notepad:", error);
            }
        }
    },[currentRoomId, activeNotepad]);

    const handleSendMessage = useCallback(async (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => {
        if (!user || !currentRoomId) return;
        const chatCollectionRef = collection(db, 'studyRooms', currentRoomId, 'chats');
        
        if(!message.text && !message.imageUrl) return;

        const messageData: any = {
          text: message.text,
          imageUrl: message.imageUrl || null,
          senderId: user.uid,
          senderName: user.username,
          timestamp: serverTimestamp(),
        };

        if (replyTo) {
          messageData.replyToId = replyTo.id;
          messageData.replyToText = replyTo.text;
        }
        
        await addDoc(chatCollectionRef, messageData);
    }, [user, currentRoomId]);

    const handleTyping = useCallback(async (isTyping: boolean) => {
        if (!user || !user.username || !currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const typingField = `typingUsers.${user.uid}`;

        try {
            if (isTyping) {
                await updateDoc(roomRef, { [typingField]: user.username });
            } else {
                await updateDoc(roomRef, { [typingField]: deleteField() });
            }
        } catch(error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update typing status:", error);
            }
        }
    }, [user, currentRoomId]);

    const handleSoundChange = useCallback(async (sound: SoundType) => {
        if (!currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        try {
            await updateDoc(roomRef, { activeSound: sound });
        } catch(error) {
            if ((error as any).code !== 'not-found') {
                console.error("Failed to update sound:", error);
            }
        }
    }, [currentRoomId]);

    const value = {
        currentRoomId,
        roomData,
        chatMessages,
        participants,
        displayTime,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        userHasLeftRef,
        isFocusMode,
        setIsFocusMode,
        joinRoom,
        leaveRoom,
        handleTimerUpdate,
        handleNotepadChange,
        handleSendMessage,
        handleTyping,
        activeSound,
        handleSoundChange,
        notepads,
        activeNotepad,
        setActiveNotepad
    };

    return <StudyRoomContext.Provider value={value}>{children}</StudyRoomContext.Provider>;
}

export function useStudyRoom(roomId?: string) {
    const context = useContext(StudyRoomContext);
    if (context === undefined) {
        throw new Error('useStudyRoom must be used within a StudyRoomProvider');
    }
    return context;
}
