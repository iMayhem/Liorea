"use client";

import { useState, useEffect } from "react";
import { useBackground, Background } from "@/shared/context/BackgroundContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function BackgroundDisplay() {
  const { currentBackground } = useBackground();
  
  // We keep track of the image currently being displayed to the user
  const [displayedBackground, setDisplayedBackground] = useState<Background | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize strictly on client to avoid hydration mismatch
  useEffect(() => {
    if (currentBackground && !displayedBackground) {
        setDisplayedBackground(currentBackground);
    }
  }, [currentBackground, displayedBackground]);

  return (
    <div className="fixed inset-0 -z-50 bg-[#050505] overflow-hidden">
      {/* 
         This AnimatePresence handles the cross-fade.
         We key by ID so Framer Motion knows when to swap them.
      */}
      <AnimatePresence mode="popLayout">
        {currentBackground && (
          <motion.div
            key={currentBackground.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // The old image fades out as the new one fades in
            transition={{ duration: 1.2, ease: "easeInOut" }} // Slow, cinematic fade
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentBackground.url}
              alt="Background"
              fill
              quality={95}
              priority
              className="object-cover"
              // When the NEW image is ready, we consider the transition 'active'
              onLoad={() => setIsLoaded(true)}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Loading State (Only visible on very first load) */}
      {!isLoaded && (
         <div className="absolute inset-0 bg-[#050505] flex items-center justify-center z-[-1]">
            <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
         </div>
      )}
    </div>
  );
}