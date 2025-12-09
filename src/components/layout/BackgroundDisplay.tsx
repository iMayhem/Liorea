"use client";

import { useState, useEffect } from "react";
import { useBackground } from "@/context/BackgroundContext";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function BackgroundDisplay() {
  const { currentBackground } = useBackground();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // When the background ID changes, reset the loaded state to show the spinner again
  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentBackground?.id]);

  return (
    // 1. Base Container with Solid Dark Color
    <div className="fixed inset-0 -z-50 bg-[#050505]"> 
      
      {/* 2. Loading State (Spinner) */}
      {/* We keep this behind the image, or fade it out when image loads */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
          isImageLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <Loader2 className="w-10 h-10 text-white/30 animate-spin mb-4" />
        <p className="text-white/30 text-xs tracking-[0.2em] uppercase font-medium">
            Loading Space...
        </p>
      </div>

      {/* 3. The Image */}
      {currentBackground && (
        <Image
          key={currentBackground.id} // Forces React to treat new backgrounds as new elements
          src={currentBackground.url}
          alt={currentBackground.name}
          fill
          quality={90}
          priority // Prioritize loading this image
          onLoad={() => setIsImageLoaded(true)} // Trigger fade-in when data is ready
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      
      {/* Optional: A subtle overlay to ensure text is always readable regardless of the image brightness */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}