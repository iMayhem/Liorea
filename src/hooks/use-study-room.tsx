// src/hooks/use-study-room.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, arrayUnion, arrayRemove, writeBatch, getDocs, deleteField, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimerState, ChatMessage, Participant, SoundType } from '@/lib/types';
import { logStudySession, updateUserProfile } from '@/lib/firestore';
import { useToast } from './use-toast';

interface StudyRoomContextType {
    currentRoomId: string | null;
    roomData: DocumentData | null;
    chatMessages: ChatMessage[];
    participants: Participant[];
    displayTime: number;
    joinRoom: (roomId: string) => Promise<boolean>;
    leaveRoom: () => void;
    handleTimerUpdate: (newState: Partial<TimerState>) => void;
    handleNotepadChange: (content: string) => void;
    handleSendMessage: (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => void;
    handleTyping: (isTyping: boolean) => void;
    handleSoundChange: (sound: SoundType) => void;
}

const StudyRoomContext = createContext<StudyRoomContextType | undefined>(undefined);

export function StudyRoomProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<DocumentData | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [displayTime, setDisplayTime] = useState(0);

    const unsubscribeRoomRef = useRef<() => void | undefined>();
    const unsubscribeChatRef = useRef<() => void | undefined>();
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const userHasLeftRef = useRef(false);
    const isInitialJoinRef = useRef(true);


    // Effect to play sounds on participant changes
    useEffect(() => {
        if (isInitialJoinRef.current) {
            isInitialJoinRef.current = false;
            return;
        }

        const playSound = (soundId: string) => {
            const sound = document.getElementById(soundId) as HTMLAudioElement;
            if (sound) {
                sound.play().catch(error => console.error(`Error playing ${soundId}:`, error));
            }
        };

        const prevParticipants = JSON.parse(sessionStorage.getItem('participants') || '[]');
        if (participants.length > prevParticipants.length) {
            playSound('join-sound');
        } else if (participants.length < prevParticipants.length) {
            playSound('leave-sound');
        }
        sessionStorage.setItem('participants', JSON.stringify(participants));

    }, [participants]);

    const cleanupListeners = useCallback(() => {
        if (unsubscribeRoomRef.current) unsubscribeRoomRef.current();
        if (unsubscribeChatRef.current) unsubscribeChatRef.current();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        unsubscribeRoomRef.current = undefined;
        unsubscribeChatRef.current = undefined;
        timerIntervalRef.current = null;
    }, []);

    const leaveRoom = useCallback(async () => {
        if (!user || !currentRoomId || userHasLeftRef.current) return;
        userHasLeftRef.current = true;
        
        cleanupListeners();
        
        await updateUserProfile(user.uid, { status: { isStudying: false, roomId: null }});

        const roomRef = doc(db, 'studyRooms', currentRoomId);
        try {
            const typingField = `typingUsers.${user.uid}`;
            await updateDoc(roomRef, { [typingField]: deleteField(), activeSound: 'none' }).catch(err => console.error("Error cleaning up room state:", err));

            const currentParticipants = (await getDoc(roomRef)).data()?.participants || [];
            if (currentParticipants.length <= 1 && currentParticipants[0]?.uid === user.uid) {
                const chatRef = collection(db, 'studyRooms', currentRoomId, 'chats');
                const chatSnapshot = await getDocs(chatRef);
                const batch = writeBatch(db);
                chatSnapshot.forEach(doc => batch.delete(doc.ref));
                batch.delete(roomRef);
                await batch.commit();
            } else {
                const userParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
                await updateDoc(roomRef, { participants: arrayRemove(userParticipant) });
            }
        } catch (error) {
            console.error("Error leaving room:", error);
            toast({ title: "Error", description: "Could not leave the room properly.", variant: "destructive" });
        } finally {
            setCurrentRoomId(null);
            setRoomData(null);
            setChatMessages([]);
            setParticipants([]);
        }
    }, [user, currentRoomId, toast, cleanupListeners]);

    const joinRoom = useCallback(async (roomId: string) => {
        if (!user) return false;
        if (currentRoomId === roomId) return true;
        if (currentRoomId && currentRoomId !== roomId) {
            await leaveRoom(); // Leave current room before joining a new one
        }

        userHasLeftRef.current = false;
        isInitialJoinRef.current = true; // Set flag to prevent sound on initial join
        const roomRef = doc(db, 'studyRooms', roomId);
        const docSnap = await getDoc(roomRef);

        if (!docSnap.exists()) {
            return false;
        }
        
        await updateUserProfile(user.uid, { status: { isStudying: true, roomId: roomId }});

        const newParticipant = { uid: user.uid, username: user.username, photoURL: user.photoURL };
        await updateDoc(roomRef, { participants: arrayUnion(newParticipant) });

        setCurrentRoomId(roomId);
        
        unsubscribeRoomRef.current = onSnapshot(roomRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setRoomData(data);
                setParticipants(data.participants || []);
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
                // Firestore onDisconnect handles this, but it's not implemented here.
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
        await updateDoc(roomRef, { timerState: { ...roomData.timerState, ...newState } });
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
                        if (user && participants.length > 0) {
                            logStudySession(participants.map(p => p.uid), getDuration(roomData.timerState));
                        }
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
        await updateDoc(roomRef, { notepadContent: content });
    },[currentRoomId]);

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

        if (isTyping) {
            await updateDoc(roomRef, { [typingField]: user.username });
        } else {
            await updateDoc(roomRef, { [typingField]: deleteField() });
        }
    }, [user, currentRoomId]);

    const handleSoundChange = useCallback(async (sound: SoundType) => {
        if (!currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        await updateDoc(roomRef, { activeSound: sound });
    }, [currentRoomId]);

    const value = {
        currentRoomId,
        roomData,
        chatMessages,
        participants,
        displayTime,
        joinRoom,
        leaveRoom,
        handleTimerUpdate,
        handleNotepadChange,
        handleSendMessage,
        handleTyping,
        handleSoundChange
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
