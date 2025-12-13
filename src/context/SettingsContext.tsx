"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TextSize = "sm" | "md" | "lg";
export type FontOption = 'inter' | 'roboto' | 'lato' | 'montserrat' | 'open-sans';
export type ThemeOption = 'default' | 'midnight' | 'forest' | 'berry' | 'sunset' | 'ocean' | 'lavender' | 'rose' | 'slate' | 'amber' | 'teal' | 'emerald';

interface SettingsContextType {
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
    font: FontOption;
    setFont: (font: FontOption) => void;
    theme: ThemeOption;
    setTheme: (theme: ThemeOption) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [textSize, setTextSizeState] = useState<TextSize>("md");
    const [font, setFontState] = useState<FontOption>("inter");
    const [theme, setThemeState] = useState<ThemeOption>("default");

    useEffect(() => {
        const storedSize = localStorage.getItem("liorea-text-size") as TextSize;
        if (storedSize) setTextSizeState(storedSize);

        const storedFont = localStorage.getItem("liorea-font") as FontOption;
        if (storedFont) {
            setFontState(storedFont);
            // Apply initial font class
            document.documentElement.classList.remove('font-inter', 'font-roboto', 'font-lato', 'font-montserrat', 'font-open-sans');
            document.documentElement.classList.add(`font-${storedFont}`);
        } else {
            // Default
            document.documentElement.classList.add(`font-inter`);
        }

        const storedTheme = localStorage.getItem("liorea-theme") as ThemeOption;
        if (storedTheme) {
            setThemeState(storedTheme);
            document.documentElement.classList.remove('theme-default', 'theme-midnight', 'theme-forest', 'theme-berry', 'theme-sunset', 'theme-ocean', 'theme-lavender', 'theme-rose', 'theme-slate', 'theme-amber', 'theme-teal', 'theme-emerald');
            document.documentElement.classList.add(`theme-${storedTheme}`);
        } else {
            document.documentElement.classList.add(`theme-default`);
        }

    }, []);

    const setTextSize = (size: TextSize) => {
        setTextSizeState(size);
        localStorage.setItem("liorea-text-size", size);

        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        if (size === "sm") document.documentElement.classList.add("text-sm");
        if (size === "md") document.documentElement.classList.add("text-base");
        if (size === "lg") document.documentElement.classList.add("text-lg");
    };

    const setFont = (newFont: FontOption) => {
        setFontState(newFont);
        localStorage.setItem("liorea-font", newFont);
        document.documentElement.classList.remove('font-inter', 'font-roboto', 'font-lato', 'font-montserrat', 'font-open-sans');
        document.documentElement.classList.add(`font-${newFont}`);
    };

    const setTheme = (newTheme: ThemeOption) => {
        setThemeState(newTheme);
        localStorage.setItem("liorea-theme", newTheme);
        document.documentElement.classList.remove('theme-default', 'theme-midnight', 'theme-forest', 'theme-berry', 'theme-sunset', 'theme-ocean', 'theme-lavender', 'theme-rose', 'theme-slate', 'theme-amber', 'theme-teal', 'theme-emerald');
        document.documentElement.classList.add(`theme-${newTheme}`);
    };

    return (
        <SettingsContext.Provider value={{ textSize, setTextSize, font, setFont, theme, setTheme }}>
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
