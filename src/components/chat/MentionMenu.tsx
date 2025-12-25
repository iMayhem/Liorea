import React from 'react';
import UserAvatar from '@/components/UserAvatar';

interface MentionMenuProps {
    isOpen: boolean;
    query: string | null;
    options: string[];
    selectedIndex: number;
    onSelect: (user: string) => void;
    className?: string;
}

export const MentionMenu: React.FC<MentionMenuProps> = ({
    isOpen,
    query,
    options,
    selectedIndex,
    onSelect,
    className = "absolute bottom-16 left-4"
}) => {
    if (!isOpen || !query || options.length === 0) return null;

    return (
        <div className={`bg-popover border border-border rounded-lg shadow-2xl overflow-hidden w-64 z-50 select-none animate-in slide-in-from-bottom-2 fade-in ${className}`}>
            <div className="px-3 py-2 text-xs uppercase font-bold text-muted-foreground tracking-wider bg-muted/50">Members</div>
            {options.map((u, i) => (
                <div
                    key={u}
                    className={`px-3 py-2 flex items-center gap-3 cursor-pointer transition-colors ${i === selectedIndex
                            ? 'bg-primary/20 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    onClick={() => onSelect(u)}
                >
                    <UserAvatar username={u} className="w-6 h-6" />
                    <span className="text-sm">{u}</span>
                </div>
            ))}
        </div>
    );
};
