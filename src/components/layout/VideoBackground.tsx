"use client";

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoBackgroundProps {
  src: string | null;
}

export default function VideoBackground({ src }: VideoBackgroundProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState(1);

  useEffect(() => {
    if (src && src !== currentSrc) {
      if (activeVideo === 1) {
        if (videoRef2.current) {
          videoRef2.current.src = src;
          videoRef2.current.play().catch(e => console.error("Error playing video:", e));
        }
        setActiveVideo(2);
      } else {
        if (videoRef1.current) {
          videoRef1.current.src = src;
          videoRef1.current.play().catch(e => console.error("Error playing video:", e));
        }
        setActiveVideo(1);
      }
      setCurrentSrc(src);
    } else if (!src) {
        setCurrentSrc(null);
    }
  }, [src, currentSrc, activeVideo]);
  
  if (!src) return <div className="absolute inset-0 bg-background transition-colors duration-1000"></div>;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
      <video
        ref={videoRef1}
        className={cn(
          "absolute h-full w-full object-cover transition-opacity duration-1000",
          activeVideo === 1 ? "opacity-100" : "opacity-0"
        )}
        autoPlay
        loop
        muted
        playsInline
        key={activeVideo === 1 ? currentSrc : ''}
        src={activeVideo === 1 ? currentSrc ?? undefined : undefined}
      />
      <video
        ref={videoRef2}
        className={cn(
          "absolute h-full w-full object-cover transition-opacity duration-1000",
          activeVideo === 2 ? "opacity-100" : "opacity-0"
        )}
        autoPlay
        loop
        muted
        playsInline
        key={activeVideo === 2 ? currentSrc : ''}
        src={activeVideo === 2 ? currentSrc ?? undefined : undefined}
      />
      <div className="absolute inset-0 bg-black/30"></div>
    </div>
  );
}
