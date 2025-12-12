"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfileContextType {
    isOpen: boolean;
    targetUsername: string | null;
    openProfile: (username: string) => void;
    closeProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [targetUsername, setTargetUsername] = useState<string | null>(null);

    const openProfile = (username: string) => {
        setTargetUsername(username);
        setIsOpen(true);
    };

    const closeProfile = () => {
        setIsOpen(false);
        setTargetUsername(null);
    };

    return (
        <UserProfileContext.Provider value={{ isOpen, targetUsername, openProfile, closeProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
