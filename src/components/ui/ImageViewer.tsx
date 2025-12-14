"use client";

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';

interface ImageViewerProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt?: string;
}

export function ImageViewer({ isOpen, onClose, src, alt = "Image" }: ImageViewerProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 border-none bg-transparent shadow-none flex items-center justify-center outline-none">
                <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                <div className="relative group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-4 -right-4 md:-right-12 z-50 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
