"use client";

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Minimize2, EyeOff } from 'lucide-react';

interface ExpandedScreenShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    stream: MediaStream | null;
    username: string;
    onStopViewing: () => void;
}

export const ExpandedScreenShareModal = ({
    isOpen,
    onClose,
    stream,
    username,
    onStopViewing
}: ExpandedScreenShareModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isOpen, stream]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] h-[90vh] bg-black/95 border-slate-800 p-0 overflow-hidden flex flex-col items-center justify-center">
                <DialogTitle className="sr-only">Screen Share</DialogTitle>

                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium bg-red-600 px-2 py-0.5 rounded text-xs animate-pulse">LIVE</span>
                        <span className="text-white text-sm font-semibold drop-shadow-md">{username}'s Screen</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={onStopViewing}
                            title="Stop viewing this stream"
                        >
                            <EyeOff className="w-4 h-4 mr-1.5" />
                            Stop Seeing
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={onClose}
                            title="Minimize"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Video Player */}
                <div className="w-full h-full flex items-center justify-center">
                    {stream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            controls
                            className="max-w-full max-h-full w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-slate-500 animate-pulse">Loading stream...</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
