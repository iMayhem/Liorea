import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    noPadding?: boolean;
}

export function BentoCard({ children, className = '', delay = 0, noPadding = false }: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                'bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all',
                !noPadding && 'p-6',
                className
            )}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={cn('', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <h3 className={cn('font-semibold', className)}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={cn('', className)}>{children}</div>;
}
