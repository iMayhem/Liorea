// src/components/shared-screen.tsx
'use client';

import * as React from 'react';
import { MonitorOff } from 'lucide-react';

interface SharedScreenProps {
  stream: MediaStream | null;
}

export function SharedScreen({ stream }: SharedScreenProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-md text-muted-foreground">
        <MonitorOff className="h-16 w-16 mb-4" />
        <p className="text-lg font-semibold">No one is sharing their screen.</p>
        <p className="text-sm">Click the screen share icon in the bottom bar to start sharing.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-md overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
    </div>
  );
}
