"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp, increment, update, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";

// Type 1: People in the Study Room (Active Timer)
export interface StudyUser {
  username: string;
  total_study_time: number;
  status: 'Online';
}

// Type 2: People in the Community (Sidebar)
export interface CommunityUser {
  username: string;
  status: 'Online' | 'Offline';
  last_seen: number;
  status_text?: string;
  is_studying: boolean; // True if they are inside the Study Room
}

interface PresenceContextType {
  username: string | null;
  setUsername: (name: string | null) => void;
  
  // Two separate lists
  studyUsers: StudyUser[];
  communityUsers: CommunityUser[];
  
  isStudying: boolean;
  
  joinSession: () => void;
  leaveSession: () => void;
  updateStatusMessage: (msg: string) => Promise<void>;
  renameUser: (newName: string) => Promise<boolean>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  
  // State for the two lists
  const [studyUsers, setStudyUsers] = useState<StudyUser[]>([]);
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>([]);
  
  const [isStudying, setIsStudying] = useState(false);
  const unsavedMinutesRef = useRef(0);
  const { toast } = useToast();

  // 1. INITIALIZATION (Load username from storage)
  useEffect(() => {
    const storedUser = localStorage.getItem('liorea-username');
    if (storedUser) setUsernameState(storedUser);
  }, []);

  const setUsername = useCallback((name: string | null) => {
    setUsernameState(name);
    if (name) {
        localStorage.setItem('liorea-username', name);
    } else {
        // Logout Logic
        if (username) {
            // Remove from Study Room
            remove(ref(db, `/study_room_presence/${username}`));
            // Mark as Offline in Community
            update(ref(db, `/community_presence/${username}`), { 
                status: 'Offline', 
                last_seen: serverTimestamp(),
                is_studying: false
            });
        }
        localStorage.removeItem('liorea-username');
        setIsStudying(false);
    }
  }, [username]);

  // 2. GLOBAL COMMUNITY PRESENCE (Always On)
  useEffect(() => {
    if (!username) return;

    const commRef = ref(db, `/community_presence/${username}`);
    const connectionRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectionRef, async (snap) => {
        if (snap.val() === true) {
            // Fetch saved status text from Cloudflare
            let savedStatus = "";
            try {
                const res = await fetch(`${WORKER_URL}/user/status?username=${username}`);
                const data = await res.json();
                if (data.status_text) savedStatus = data.status_text;
            } catch (e) {}

            // Set user as ONLINE in Global Community
            update(commRef, {
                username: username,
                status: 'Online',
                last_seen: serverTimestamp(),
                status_text: savedStatus,
            });

            // On Disconnect: Set to OFFLINE (Do not remove node)
            onDisconnect(commRef).update({
                status: 'Offline',
                last_seen: serverTimestamp(),
                is_studying: false 
            });
        }
    });

    return () => unsubscribe();
  }, [username]);


  // 3. ACTIVE STUDY PRESENCE (Only when "Studying")
  useEffect(() => {
    if (!username) return;

    const studyRef = ref(db, `/study_room_presence/${username}`);
    const commRef = ref(db, `/community_presence/${username}`);

    if (isStudying) {
        // A. Add to Study Room List
        set(studyRef, {
            username: username,
            total_study_time: 0, // Starts at 0 for this session
            status: 'Online'
        });
        
        // B. Update Community List to show "Studying" icon
        update(commRef, { is_studying: true });

        // C. Disconnect logic
        onDisconnect(studyRef).remove();
    } else {
        // User clicked Leave
        remove(studyRef);
        update(commRef, { is_studying: false });
    }

    return () => {
        if (!isStudying && username) {
             remove(studyRef);
             update(commRef, { is_studying: false }).catch(() => {});
        }
    };
  }, [username, isStudying]);


  // 4. READ DATA: Study Users List
  useEffect(() => {
    const roomRef = ref(db, '/study_room_presence');
    return onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: StudyUser[] = Object.values(data).map((u: any) => ({
                username: u.username,
                total_study_time: u.total_study_time || 0,
                status: 'Online'
            }));
            list.sort((a, b) => b.total_study_time - a.total_study_time);
            setStudyUsers(list);
        } else {
            setStudyUsers([]);
        }
    });
  }, []);

  // 5. READ DATA: Community Users List
  useEffect(() => {
    const globalRef = ref(db, '/community_presence');
    return onValue(globalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: CommunityUser[] = Object.values(data).map((u: any) => ({
                username: u.username,
                status: u.status || 'Offline',
                last_seen: u.last_seen || Date.now(),
                status_text: u.status_text || "",
                is_studying: u.is_studying || false
            }));
            
            // Sort: Online first, then by Last Seen
            list.sort((a, b) => {
                if (a.status === 'Online' && b.status !== 'Online') return -1;
                if (a.status !== 'Online' && b.status === 'Online') return 1;
                return b.last_seen - a.last_seen;
            });
            setCommunityUsers(list);
        } else {
            setCommunityUsers([]);
        }
    });
  }, []);


  // 6. TIMER LOGIC
  useEffect(() => {
    if (!username || !isStudying) return;

    const flushToCloudflare = () => {
        const amount = unsavedMinutesRef.current;
        if (amount > 0) {
            fetch(`${WORKER_URL}/study/update`, {
                method: "POST",
                body: JSON.stringify({ username }), 
                headers: { "Content-Type": "application/json" }
            }).catch(()=>{});
            unsavedMinutesRef.current = 0;
        }
    };

    const interval = setInterval(() => {
        // Update Study Timer in Firebase
        const myStudyTimeRef = ref(db, `/study_room_presence/${username}/total_study_time`);
        set(myStudyTimeRef, increment(60)); 
        
        unsavedMinutesRef.current += 1;
        if (unsavedMinutesRef.current >= 5) flushToCloudflare();
    }, 60000);

    return () => {
        clearInterval(interval);
        flushToCloudflare();
    };
  }, [username, isStudying]);

  // Actions
  const joinSession = useCallback(() => setIsStudying(true), []);
  const leaveSession = useCallback(() => setIsStudying(false), []);

  const updateStatusMessage = useCallback(async (msg: string) => {
    if (!username) return;
    update(ref(db, `/community_presence/${username}`), { status_text: msg });
    fetch(`${WORKER_URL}/user/status`, {
        method: 'POST',
        body: JSON.stringify({ username, status_text: msg }),
        headers: { 'Content-Type': 'application/json' }
    });
    toast({ title: "Status Updated" });
  }, [username, toast]);

  const renameUser = useCallback(async (newName: string) => {
      setUsername(newName);
      return true;
  }, [setUsername]);

  const value = useMemo(() => ({
    username, setUsername, 
    studyUsers, communityUsers, 
    isStudying, joinSession, leaveSession, updateStatusMessage, renameUser
  }), [username, setUsername, studyUsers, communityUsers, isStudying, joinSession, leaveSession, updateStatusMessage, renameUser]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
    const c = useContext(PresenceContext);
    if (c === undefined) throw new Error("usePresence error");
    return c;
};