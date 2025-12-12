import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function BentoCard({ children, className = '', delay = 0 }: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all ${className}`}
        >
            {children}
        </motion.div>
    );
}
