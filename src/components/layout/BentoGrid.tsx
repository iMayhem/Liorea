import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
    return (
        <div className={cn("w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center", className)}>
            {children}
        </div>
    );
};

interface BentoItemProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4 | 5;
    colSpanMd?: 1 | 2 | 3 | 4 | 5;
    colSpanLg?: 1 | 2 | 3 | 4 | 5;
}

export const BentoItem = ({ children, className, colSpan = 1, colSpanMd, colSpanLg }: BentoItemProps) => {
    // Helper to map number to tailwind class
    const getColSpan = (span: number | undefined, prefix: string = '') => {
        if (!span) return '';
        const p = prefix ? `${prefix}:` : '';
        return `${p}col-span-${span}`;
    }

    return (
        <div className={cn(
            getColSpan(colSpan),
            colSpanMd && getColSpan(colSpanMd, 'md'),
            colSpanLg && getColSpan(colSpanLg, 'lg'),
            className
        )}>
            {children}
        </div>
    );
};
