"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TextSize = "sm" | "md" | "lg";

interface SettingsContextType {
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [textSize, setTextSizeState] = useState<TextSize>("md");

    useEffect(() => {
        const stored = localStorage.getItem("liorea-text-size") as TextSize;
        if (stored) setTextSizeState(stored);
    }, []);

    const setTextSize = (size: TextSize) => {
        setTextSizeState(size);
        localStorage.setItem("liorea-text-size", size);

        // Apply to root html element for global Tailwind handling (optional but good)
        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        if (size === "sm") document.documentElement.classList.add("text-sm");
        if (size === "md") document.documentElement.classList.add("text-base");
        if (size === "lg") document.documentElement.classList.add("text-lg");
    };

    return (
        <SettingsContext.Provider value={{ textSize, setTextSize }}>
            <div className={`contents ${textSize === 'sm' ? 'text-sm' : textSize === 'lg' ? 'text-base sm:text-lg' : 'text-base'}`}>
                {children}
            </div>
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};
