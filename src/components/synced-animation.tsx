// src/components/synced-animation.tsx
'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncedAnimationProps {
    animation: {
        type: '🌧️' | '🔥' | '❄️' | null;
        timestamp: any; // Firebase timestamp
    } | null;
}

const ANIMATION_DURATION_MS = 5000;

const RainDrop = () => (
    <motion.div
        className="absolute w-1 h-8 bg-blue-300 rounded-full"
        initial={{ y: '-10vh', x: Math.random() * 100 + 'vw' }}
        animate={{ y: '110vh' }}
        transition={{ duration: Math.random() * 0.5 + 0.5, repeat: Infinity, ease: "linear" }}
        style={{ left: `${Math.random() * 100}%` }}
    />
);

const FireParticle = () => (
     <motion.div
        className="absolute rounded-full"
        initial={{ y: '100vh', opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
        animate={{ y: '-10vh', opacity: 0 }}
        transition={{ duration: Math.random() * 2 + 1, ease: "easeOut" }}
        style={{ 
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            background: `radial-gradient(circle, rgba(255,165,0,0.8) 0%, rgba(255,69,0,0) 70%)`
         }}
    />
);

const Snowflake = () => (
    <motion.div
        className="absolute text-2xl"
        initial={{ y: '-10vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
        animate={{ y: '110vh', x: `calc(${Math.random() * 100}vw + ${Math.sin(Math.random() * Math.PI * 2) * 50}px)`, opacity: 1}}
        transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
        style={{ left: `${Math.random() * 100}%` }}
    >
        ❄️
    </motion.div>
);


export function SyncedAnimation({ animation }: SyncedAnimationProps) {
    const [currentAnimation, setCurrentAnimation] = React.useState<'🌧️' | '🔥' | '❄️' | null>(null);

    React.useEffect(() => {
        if (animation?.type) {
            setCurrentAnimation(animation.type);
            const timer = setTimeout(() => {
                setCurrentAnimation(null);
            }, ANIMATION_DURATION_MS);
            return () => clearTimeout(timer);
        }
    }, [animation]);

    const renderAnimation = () => {
        const count = 50; // Number of particles
        switch (currentAnimation) {
            case '🌧️':
                return Array.from({ length: count }).map((_, i) => <RainDrop key={i} />);
            case '🔥':
                return Array.from({ length: count }).map((_, i) => <FireParticle key={i} />);
            case '❄️':
                return Array.from({ length: count }).map((_, i) => <Snowflake key={i} />);
            default:
                return null;
        }
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {currentAnimation && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderAnimation()}
                     </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
