"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.4
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}