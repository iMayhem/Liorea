"use client";

import { useBackgrounds } from "@/features/backgrounds/useBackgrounds";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useBackground } from "@/context/BackgroundContext"; // Keep context for now if used elsewhere, or replace entirely.

// NOTE: Ideally, we replace the Context entirely. 
// For now, let's simplify the display logic.

export default function BackgroundDisplay() {
  // You can switch to useBackgrounds() hook here if you remove the Provider from layout.tsx
  // For this step, let's assume we are keeping the Provider for global state but simplifying the render.
  const { currentBackground } = useBackground(); 

  return (
    <div className="fixed inset-0 -z-50 bg-[#050505] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {currentBackground && (
          <motion.div
            key={currentBackground.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentBackground.url}
              alt="Background"
              fill
              quality={90}
              priority
              className="object-cover opacity-60" // Built-in dimming
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}