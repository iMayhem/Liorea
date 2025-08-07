// src/components/synced-animation.tsx
'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnimationType } from '@/lib/types';

interface SyncedAnimationProps {
    animation: {
        type: AnimationType | null;
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

const ConfettiParticle = () => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const rotate = Math.random() * 360;
    return (
        <motion.div
            className="absolute"
            initial={{ opacity: 1, y: '0vh', x: `${x}vw`, rotate }}
            animate={{ opacity: 0, y: '100vh', rotate: rotate + Math.random() * 360 }}
            transition={{ duration: Math.random() * 3 + 2, ease: "easeOut" }}
            style={{ 
                width: '10px',
                height: '20px',
                backgroundColor: color,
             }}
        />
    )
};

const StarParticle = () => (
    <motion.div
        className="absolute text-yellow-300"
        initial={{ opacity: 0, scale: 0, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
        animate={{ opacity: [0, 1, 0], scale: [0, Math.random() * 1.5, 0]}}
        transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: 'easeInOut' }}
    >
        ★
    </motion.div>
)

export function SyncedAnimation({ animation }: SyncedAnimationProps) {
    const [currentAnimation, setCurrentAnimation] = React.useState<AnimationType | null>(null);

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
            case 'rain':
                return Array.from({ length: count }).map((_, i) => <RainDrop key={i} />);
            case 'fire':
                return Array.from({ length: count }).map((_, i) => <FireParticle key={i} />);
            case 'snow':
                return Array.from({ length: count }).map((_, i) => <Snowflake key={i} />);
            case 'confetti':
                return Array.from({ length: 100 }).map((_, i) => <ConfettiParticle key={i} />);
            case 'stars':
                return Array.from({ length: 70 }).map((_, i) => <StarParticle key={i} />);
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
