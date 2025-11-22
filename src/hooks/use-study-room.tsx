'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, Participant, SoundType, StudyRoom, TimerState } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { logStudySession } from '@/lib/db'; // Import the new DB function

interface StudyRoomContextType {
    currentRoomId: string | null;
    isLeaving: boolean;
    roomData: StudyRoom | null;
    chatMessages: ChatMessage[];
    participants: Participant[];
    timerState: TimerState;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    isMuted: boolean;
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
    isLeaderboardOpen: boolean;
    setIsLeaderboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
    joinRoom: (roomId: string) => Promise<boolean>;
    leaveRoom: () => void;
    handleSendMessage: (message: {text: string, imageUrl?: string | null}, replyTo: { id: string, text: string } | null) => void;
    activeSound: SoundType;
    handleSoundChange: (sound: SoundType) => void;
}

const StudyRoomContext = createContext<StudyRoomContextType | undefined>(undefined);

// 50 Minutes in Milliseconds
const STUDY_CYCLE_MS = 50 * 60 * 1000;

export function StudyRoomProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<StudyRoom | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    
    const [timerState, setTimerState] = useState<TimerState>({
        mode: 'study',
        time: 3000,
        isActive: true,
        totalDuration: 3000
    });

    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [activeSound, setActiveSound] = useState<SoundType>('none');
    
    const joinedRoomRef = useRef<string | null>(null);

    // --- GLOBAL TIMER LOGIC ---
    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = now % STUDY_CYCLE_MS;
            const remaining = STUDY_CYCLE_MS - elapsed;
            const remainingSeconds = Math.ceil(remaining / 1000);

            setTimerState({
                mode: 'study',
                isActive: true,
                time: remainingSeconds,
                totalDuration: STUDY_CYCLE_MS / 1000
            });
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- STUDY TRACKING LOGIC (NEW) ---
    // Automatically logs 60 seconds of study time every minute you are in a room
    useEffect(() => {
        if (!currentRoomId || !user) return;

        console.log("[StudyTracker] ⏱️ Timer Started. You will be credited 60s every minute.");

        const trackingInterval = setInterval(() => {
            console.log("[StudyTracker] 1 Minute Passed. Updating DB...");
            logStudySession(user.uid, 60);
        }, 60000); // 60000 ms = 1 minute

        return () => {
            console.log("[StudyTracker] Timer Stopped (Left Room).");
            clearInterval(trackingInterval);
        };
    }, [currentRoomId, user]);

    // --- ROOM SUBSCRIPTION ---
    useEffect(() => {
        if (!currentRoomId) return;

        const fetchInitial = async () => {
            const { data, error } = await supabase.from('rooms').select('*').eq('id', currentRoomId).single();
            
            if (error || !data) return;

            const roomObj: StudyRoom = {
                id: data.id,
                ownerId: data.owner_id,
                participants: data.participants || [],
                activeSound: data.active_sound || 'none',
                current_video_id: data.current_video_id
            };

            setRoomData(roomObj);
            setParticipants(roomObj.participants);
            setActiveSound(roomObj.activeSound);
            
            const { data: chats } = await supabase
                .from('chats')
                .select('*')
                .eq('room_id', currentRoomId)
                .order('timestamp', { ascending: true })
                .limit(50);
            if (chats) setChatMessages(chats as any);
        };

        fetchInitial();

        const channel = supabase.channel(`room:${currentRoomId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${currentRoomId}` }, (payload: any) => {
                const newData = payload.new;
                setRoomData(prev => prev ? ({...prev, ...newData}) : null);
                if(newData.participants) setParticipants(newData.participants);
                if(newData.active_sound) setActiveSound(newData.active_sound);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `room_id=eq.${currentRoomId}` }, (payload: any) => {
                setChatMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [currentRoomId]);

    const joinRoom = useCallback(async (roomId: string) => {
        if (!user) return false;
        if (joinedRoomRef.current === roomId) return true;

        setCurrentRoomId(roomId); 
        joinedRoomRef.current = roomId;

        const { data: existingRoom } = await supabase.from('rooms').select('*').eq('id', roomId).single();
        
        const me: Participant = { 
            uid: user.uid, 
            username: profile?.username || 'User', 
            photoURL: profile?.photoURL, 
            joinedAt: new Date().toISOString() 
        };

        if (!existingRoom) {
            await supabase.from('rooms').insert({
                id: roomId,
                owner_id: user.uid,
                participants: [me],
                active_sound: 'none'
            });
            setRoomData({
                id: roomId, ownerId: user.uid, participants: [me], activeSound: 'none'
            });
        } else {
            let parts = existingRoom.participants || [];
            if (!parts.some((p: any) => p.uid === user.uid)) {
                parts.push(me);
                await supabase.from('rooms').update({ participants: parts }).eq('id', roomId);
            }
        }
        return true;
    }, [user, profile]);

    const leaveRoom = useCallback(async () => {
        if (!user || !currentRoomId) return;
        setIsLeaving(true);
        
        const { data } = await supabase.from('rooms').select('participants').eq('id', currentRoomId).single();
        if (data) {
            const newParts = (data.participants || []).filter((p: any) => p.uid !== user.uid);
            await supabase.from('rooms').update({ participants: newParts }).eq('id', currentRoomId);
        }

        setCurrentRoomId(null);
        joinedRoomRef.current = null;
        setRoomData(null);
        setIsLeaving(false);
        router.push('/study-together');
    }, [currentRoomId, user, router]);

    const handleSendMessage = async (message: {text: string}, replyTo: any) => {
        if(!user || !currentRoomId) return;
        await supabase.from('chats').insert({
            room_id: currentRoomId,
            sender_id: user.uid,
            sender_name: profile?.username,
            text: message.text,
            timestamp: new Date().toISOString()
        });
    };

    const handleSoundChange = (s: SoundType) => {
        const newSound = activeSound === s ? 'none' : s;
        setActiveSound(newSound);
        if (currentRoomId) {
            supabase.from('rooms').update({ active_sound: newSound }).eq('id', currentRoomId);
        }
    };

    const value = {
        currentRoomId, isLeaving, roomData, chatMessages, participants, 
        timerState, volume, setVolume, isMuted, setIsMuted,
        joinRoom, leaveRoom, handleSendMessage, activeSound, handleSoundChange,
        isLeaderboardOpen, setIsLeaderboardOpen
    };

    return <StudyRoomContext.Provider value={value}>{children}</StudyRoomContext.Provider>;
}

export function useStudyRoom() {
    const context = useContext(StudyRoomContext);
    if (!context) throw new Error('useStudyRoom error');
    return context;
}