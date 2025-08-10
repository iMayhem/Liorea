// src/hooks/use-study-room.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, arrayUnion, arrayRemove, writeBatch, getDocs, deleteField, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimerState, ChatMessage, Participant, SoundType, Notepads, PrivateChatMessage as PrivateChatMessageType } from '@/lib/types';
import { logStudySession, updateUserProfile, getAllUsers, getLastPrivateMessage } from '@/lib/firestore';
import { useToast } from './use-toast';
import { usePathname, useRouter } from 'next/navigation';

const NOTEPAD_IDS = ['collaborative', 'notepad1', 'notepad2'];
const LAST_SEEN_KEY_PREFIX = 'privateChatLastSeen_';
const BEAST_MODE_END_TIME_KEY = 'beastModeEndTime';


interface StudyRoomContextType {
    currentRoomId: string | null;
    isLeaving: boolean;
    roomData: DocumentData | null;
    chatMessages: ChatMessage[];
    participants: Participant[];
    displayTime: number;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    isMuted: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
    userHasLeftRef: React.MutableRefObject<boolean>;
    isBeastMode: boolean;
    isBeastModeLocked: boolean;
    beastModeDisplayTime: number;
    isFocusMode: boolean;
    setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
    isPrivateChatOpen: boolean;
    setIsPrivateChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isLeaderboardOpen: boolean;
    setIsLeaderboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
    hasNewPrivateMessage: boolean;
    newMessagesFrom: Set<string>;
    clearChatNotification: (userId: string) => void;
    joinRoom: (roomId: string) => Promise<boolean>;
    leaveRoom: () => void;
    handleTimerUpdate: (newState: Partial<TimerState>) => void;
    toggleBeastMode: () => void;
    handleNotepadChange: (newContent: string) => void;
    handleNotepadNameChange: (newName: string) => void;
    cycleNotepad: () => void;
    handleSendMessage: (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => void;
    handleTyping: (isTyping: boolean) => void;
    activeSound: SoundType;
    handleSoundChange: (sound: SoundType) => void;
    notepads: Notepads;
    activeNotepadId: string;
    claimNotepad: () => void;
}

const StudyRoomContext = createContext<StudyRoomContextType | undefined>(undefined);

const TIME_LOG_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function StudyRoomProvider({ children }: { children: ReactNode }) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    const [roomData, setRoomData] = useState<DocumentData | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [displayTime, setDisplayTime] = useState(0);
    const [volume, setVolume] = React.useState(0.5);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFocusMode, setIsFocusMode] = React.useState(false);
    const [isPrivateChatOpen, setIsPrivateChatOpen] = React.useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = React.useState(false);
    
    // Beast Mode State
    const [beastModeEndTime, setBeastModeEndTime] = useState<number | null>(null);
    const [beastModeDisplayTime, setBeastModeDisplayTime] = useState(0);
    const isBeastModeLocked = beastModeEndTime !== null && beastModeEndTime > Date.now();
    const isBeastMode = isBeastModeLocked; // Alias for simplicity
    
    // Notification state
    const [newMessagesFrom, setNewMessagesFrom] = React.useState<Set<string>>(new Set());
    const hasNewPrivateMessage = newMessagesFrom.size > 0;

    // Notepad state
    const [notepads, setNotepads] = useState<Notepads>({});
    const [activeNotepadId, setActiveNotepadId] = useState<string>('collaborative');

    const activeSound = roomData?.activeSound || 'none';


    const unsubscribeRoomRef = useRef<() => void | undefined>();
    const unsubscribeChatRef = useRef<() => void | undefined>();
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const logTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const userHasLeftRef = useRef(false);
    const isInitialJoinRef = useRef(true);

    const toggleBeastMode = useCallback(() => {
        const endTime = Date.now() + 25 * 60 * 1000;
        localStorage.setItem(BEAST_MODE_END_TIME_KEY, endTime.toString());
        setBeastModeEndTime(endTime);
        setIsFocusMode(true); // Automatically enter focus mode
        
        // Redirect to home page
        if (profile?.preparationPath) {
             switch (profile.preparationPath) {
                case 'neet-achiever':
                  router.push('/neet-achiever-home');
                  break;
                case 'neet-other':
                  router.push('/neet-home');
                  break;
                case 'jee':
                  router.push('/jee-home');
                  break;
                default:
                  router.push('/');
                  break;
            }
        } else {
            router.push('/');
        }

    }, [profile, router]);

    // Beast mode countdown effect
    useEffect(() => {
        // On initial load, check local storage for an active beast mode session
        const storedEndTime = localStorage.getItem(BEAST_MODE_END_TIME_KEY);
        if (storedEndTime) {
            const endTime = parseInt(storedEndTime, 10);
            if (endTime > Date.now()) {
                setBeastModeEndTime(endTime);
                setIsFocusMode(true);
            } else {
                localStorage.removeItem(BEAST_MODE_END_TIME_KEY);
            }
        }

        const interval = setInterval(() => {
            if (beastModeEndTime && beastModeEndTime > Date.now()) {
                const remaining = Math.max(0, beastModeEndTime - Date.now());
                setBeastModeDisplayTime(Math.round(remaining / 1000));
            } else if (beastModeEndTime) {
                setBeastModeEndTime(null);
                setIsFocusMode(false);
                localStorage.removeItem(BEAST_MODE_END_TIME_KEY);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [beastModeEndTime]);
    
     // Effect to handle site-wide mute during beast mode
    useEffect(() => {
        if (isBeastModeLocked) {
            setIsMuted(true);
        }
    }, [isBeastModeLocked]);


    // Effect for private chat notifications
    useEffect(() => {
        if (!user) {
            setNewMessagesFrom(new Set());
            return;
        }

        const checkMessages = async () => {
            try {
                const allUsers = await getAllUsers();
                const otherUsers = allUsers.filter(u => u.uid !== user.uid);
                
                const updatedNewMessages = new Set(newMessagesFrom);

                for (const otherUser of otherUsers) {
                    const lastSeenKey = `${LAST_SEEN_KEY_PREFIX}${otherUser.uid}`;
                    const lastSeenTimestampStr = localStorage.getItem(lastSeenKey);
                    const lastSeenTimestamp = lastSeenTimestampStr ? new Date(lastSeenTimestampStr).getTime() : 0;
                    
                    const chatRoomId = user.uid < otherUser.uid ? `${user.uid}_${otherUser.uid}` : `${otherUser.uid}_${user.uid}`;
                    const lastMessage = await getLastPrivateMessage(chatRoomId);

                    if (lastMessage && lastMessage.timestamp) {
                         const messageTimestamp = lastMessage.timestamp instanceof Timestamp 
                            ? lastMessage.timestamp.toDate().getTime() 
                            : new Date(lastMessage.timestamp).getTime();

                        if (messageTimestamp > lastSeenTimestamp && lastMessage.senderId !== user.uid) {
                            updatedNewMessages.add(otherUser.uid);
                        }
                    }
                }
                setNewMessagesFrom(updatedNewMessages);
            } catch (error) {
                console.error("Error checking for new private messages:", error);
            }
        };

        const intervalId = setInterval(checkMessages, 10000); // Check every 10 seconds
        checkMessages(); // Initial check

        return () => clearInterval(intervalId);

    }, [user, newMessagesFrom]);

    const clearChatNotification = useCallback((userId: string) => {
        const lastSeenKey = `${LAST_SEEN_KEY_PREFIX}${userId}`;
        localStorage.setItem(lastSeenKey, new Date().toISOString());
        setNewMessagesFrom(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    }, []);

    // Effect to play sounds on participant changes
    useEffect(() => {
        if (isInitialJoinRef.current || !currentRoomId || isBeastModeLocked) {
            isInitialJoinRef.current = false;
            return;
        }

        const playSound = (soundId: string) => {
            const sound = document.getElementById(soundId) as HTMLAudioElement;
            if (sound) {
                sound.play().catch(error => {
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

    }, [participants, currentRoomId, isBeastModeLocked]);

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
    
    // Update user's beast mode status in Firestore when local state changes
    useEffect(() => {
        if (user && currentRoomId) {
            updateUserProfile(user.uid, { status: { isStudying: true, isJamming: false, isBeastMode: isBeastMode, roomId: currentRoomId }});
        }
    }, [isBeastMode, user, currentRoomId]);

    const leaveRoom = useCallback(async () => {
        if (!user || !profile || !currentRoomId) return;
        setIsLeaving(true);

        const leavingRoomId = currentRoomId;

        try {
            // Background cleanup
            await updateUserProfile(user.uid, { status: { isStudying: false, isJamming: false, isBeastMode: false, roomId: null } });

            const roomRef = doc(db, 'studyRooms', leavingRoomId);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                const userParticipant = { uid: user.uid, username: profile.username, photoURL: profile.photoURL };
                const typingField = `typingUsers.${user.uid}`;
                await updateDoc(roomRef, {
                    participants: arrayRemove(userParticipant),
                    [typingField]: deleteField(),
                });
            }
        } catch (error) {
            if ((error as any).code !== 'not-found') {
                console.error("Error during room cleanup:", error);
                toast({ title: "Error", description: "Could not fully leave the room.", variant: "destructive" });
            }
        } finally {
            // UI update
            if (currentRoomId === leavingRoomId) {
                userHasLeftRef.current = true;
                setCurrentRoomId(null); 
                setRoomData(null);
                setChatMessages([]);
                setParticipants([]);
                setIsFocusMode(false);
                setBeastModeEndTime(null);
                localStorage.removeItem(BEAST_MODE_END_TIME_KEY);
                cleanupListeners();
            }
            setIsLeaving(false);
            router.push('/study-together');
        }

    }, [user, profile, currentRoomId, toast, cleanupListeners, router]);
    
    // Effect for periodic time logging
    useEffect(() => {
        if (logTimeIntervalRef.current) clearInterval(logTimeIntervalRef.current);

        if (currentRoomId && user && !isBeastModeLocked) { // Don't log if in beast mode via pomodoro
            logTimeIntervalRef.current = setInterval(() => {
                logStudySession([user.uid], TIME_LOG_INTERVAL_MS / 1000);
            }, TIME_LOG_INTERVAL_MS);
        }

        return () => {
            if (logTimeIntervalRef.current) clearInterval(logTimeIntervalRef.current);
        }
    }, [currentRoomId, user, isBeastModeLocked]);


    const joinRoom = useCallback(async (roomId: string) => {
        userHasLeftRef.current = false;
        if (!user || !profile?.username) return false;
        
        if (profile.isBlocked) {
            toast({ title: "Access Denied", description: "You are currently blocked from joining study rooms.", variant: "destructive" });
            return false;
        }

        if (currentRoomId === roomId) return true;
        if (currentRoomId && currentRoomId !== roomId) {
            await leaveRoom();
        }

        isInitialJoinRef.current = true;
        const roomRef = doc(db, 'studyRooms', roomId);
        const docSnap = await getDoc(roomRef);

        if (!docSnap.exists()) {
            return false;
        }
        
        await updateUserProfile(user.uid, { status: { isStudying: true, isJamming: false, isBeastMode: isBeastModeLocked, roomId: roomId }});

        const newParticipant = { uid: user.uid, username: profile.username, photoURL: profile.photoURL, isBeastMode: isBeastModeLocked };
        const currentParticipants = docSnap.data().participants || [];
        if(!currentParticipants.some((p: Participant) => p.uid === user.uid)) {
             await updateDoc(roomRef, { participants: arrayUnion(newParticipant) });
        }


        setCurrentRoomId(roomId);
        setActiveNotepadId('collaborative');
        
        unsubscribeRoomRef.current = onSnapshot(roomRef, (snap) => {
            if (userHasLeftRef.current && snap.id === currentRoomId) {
                return;
            }
            if (snap.exists()) {
                const data = snap.data();
                setRoomData(data);
                setParticipants(data.participants || []);
                setNotepads(data.notepads || {});
            } else {
                cleanupListeners();
                setCurrentRoomId(null);
                 if (!userHasLeftRef.current) {
                    toast({ title: "Room Closed", description: "The study room was deleted.", variant: "destructive" });
                    router.push('/study-together');
                 }
            }
        });

        const chatQuery = query(collection(db, 'studyRooms', roomId, 'chats'), orderBy('timestamp', 'asc'));
        unsubscribeChatRef.current = onSnapshot(chatQuery, (querySnapshot) => {
             if (userHasLeftRef.current) return;
            const messages: ChatMessage[] = [];
            querySnapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
            setChatMessages(messages);
        });
        
        return true;
    }, [user, profile, currentRoomId, leaveRoom, toast, cleanupListeners, router, isBeastModeLocked]);

    // Effect to handle component unmount or tab close
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (currentRoomId) {
                leaveRoom();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (currentRoomId) {
                leaveRoom();
            }
        };
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


    // Notepad handlers
    const handleNotepadChange = useCallback(async (content: string) => {
        if (!user || !currentRoomId || !notepads[activeNotepadId]) return;

        const notepad = notepads[activeNotepadId];
        const isOwner = notepad.owner === user.uid;
        const isCollaborative = activeNotepadId === 'collaborative';
        
        if (!isOwner && !isCollaborative) return; 

        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const fieldPath = `notepads.${activeNotepadId}.content`;
        try {
            await updateDoc(roomRef, { [fieldPath]: content });
        } catch (error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update notepad content:", error);
            }
        }
    }, [user, currentRoomId, activeNotepadId, notepads]);
    
    const handleNotepadNameChange = useCallback(async (newName: string) => {
        if (!user || !currentRoomId || activeNotepadId === 'collaborative' || !notepads[activeNotepadId]) return;

        const notepad = notepads[activeNotepadId];
        const isOwner = notepad.owner === user.uid;
        const isUnclaimed = !notepad.owner;

        if (!isOwner && !isUnclaimed) return;

        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const fieldPath = `notepads.${activeNotepadId}.name`;
        try {
            if (isUnclaimed) {
                 await updateDoc(roomRef, { 
                     [fieldPath]: newName,
                     [`notepads.${activeNotepadId}.owner`]: user.uid
                 });
            } else {
                await updateDoc(roomRef, { [fieldPath]: newName });
            }
        } catch (error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update notepad name:", error);
            }
        }
    }, [user, currentRoomId, activeNotepadId, notepads]);

    const claimNotepad = useCallback(async () => {
        if (!user || !currentRoomId || !notepads[activeNotepadId] || notepads[activeNotepadId].owner) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const fieldPath = `notepads.${activeNotepadId}.owner`;
        try {
            await updateDoc(roomRef, { [fieldPath]: user.uid });
        } catch (error) {
            if ((error as any).code !== 'not-found') {
                console.error("Failed to claim notepad:", error);
            }
        }
    }, [user, currentRoomId, activeNotepadId, notepads]);

    const cycleNotepad = useCallback(() => {
        const currentIndex = NOTEPAD_IDS.indexOf(activeNotepadId);
        const nextIndex = (currentIndex + 1) % NOTEPAD_IDS.length;
        setActiveNotepadId(NOTEPAD_IDS[nextIndex]);
    }, [activeNotepadId]);


    // Other handlers
    const handleSendMessage = useCallback(async (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => {
        if (!user || !profile?.username || !currentRoomId) return;
        const chatCollectionRef = collection(db, 'studyRooms', currentRoomId, 'chats');
        
        if(!message.text && !message.imageUrl) return;

        const messageData: any = {
          text: message.text,
          imageUrl: message.imageUrl || null,
          senderId: user.uid,
          senderName: profile.username,
          timestamp: serverTimestamp(),
        };

        if (replyTo) {
          messageData.replyToId = replyTo.id;
          messageData.replyToText = replyTo.text;
        }
        
        await addDoc(chatCollectionRef, messageData);
    }, [user, profile, currentRoomId]);

    const handleTyping = useCallback(async (isTyping: boolean) => {
        if (!user || !profile?.username || !currentRoomId) return;
        const roomRef = doc(db, 'studyRooms', currentRoomId);
        const typingField = `typingUsers.${user.uid}`;

        try {
            if (isTyping) {
                await updateDoc(roomRef, { [typingField]: profile.username });
            } else {
                await updateDoc(roomRef, { [typingField]: deleteField() });
            }
        } catch(error) {
             if ((error as any).code !== 'not-found') {
                console.error("Failed to update typing status:", error);
            }
        }
    }, [user, profile, currentRoomId]);

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
        isLeaving,
        roomData,
        chatMessages,
        participants,
        displayTime,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        userHasLeftRef,
        isBeastMode,
        isBeastModeLocked,
        beastModeDisplayTime,
        isFocusMode,
        setIsFocusMode,
        isPrivateChatOpen,
        setIsPrivateChatOpen,
        isLeaderboardOpen,
        setIsLeaderboardOpen,
        hasNewPrivateMessage,
        newMessagesFrom,
        clearChatNotification,
        joinRoom,
        leaveRoom,
        handleTimerUpdate,
        toggleBeastMode,
        handleNotepadChange,
        handleNotepadNameChange,
        cycleNotepad,
        handleSendMessage,
        handleTyping,
        activeSound,
        handleSoundChange,
        notepads,
        activeNotepadId,
        claimNotepad,
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
