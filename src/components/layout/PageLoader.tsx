"use client";

import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
