"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from "../context/GamificationContext";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Assuming react-use or custom hook, but I'll implement simple size if needed
import { X } from "lucide-react";

export function LevelUpModal() {
    const { stats } = useGamification();
    const [show, setShow] = useState(false);
    const [prevLevel, setPrevLevel] = useState(stats.level);

    // Simple window size hook
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    useEffect(() => {
        if (stats.level > prevLevel) {
            setShow(true);
            setPrevLevel(stats.level);
            // Auto hide after 5s
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [stats.level, prevLevel]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShow(false)}
                >
                    <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: 50 }}
                        className="relative bg-[#1e1f22] border border-yellow-500/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                            className="text-6xl"
                        >
                            🎉
                        </motion.div>

                        <div className="text-center space-y-1">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
                                LEVEL UP!
                            </h2>
                            <p className="text-zinc-300">
                                You reached <span className="text-yellow-400 font-bold text-xl">Level {stats.level}</span>
                            </p>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 w-full text-center">
                            <p className="text-sm text-yellow-200">
                                Rewards Unlocked:
                            </p>
                            <div className="font-mono text-lg font-bold text-white mt-1">
                                +100 Coins
                            </div>
                        </div>

                        <button
                            onClick={() => setShow(false)}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition-colors mt-2"
                        >
                            Awesome!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
