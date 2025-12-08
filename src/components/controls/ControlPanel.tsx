
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Image as ImageIcon, ChevronUp } from 'lucide-react';
import SoundscapeMixer from './SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { useBackground } from '@/context/BackgroundContext';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';


export default function ControlPanel() {
  const { cycleBackground } = useBackground();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
      <Card className={cn(
          "bg-black/30 backdrop-blur-md border border-white/20 shadow-lg rounded-full transition-all duration-300 ease-in-out",
           isOpen ? 'rounded-3xl' : 'rounded-full'
        )}>
        {isOpen && (
            <div className="p-4 pt-12 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
                <SoundscapeMixer sounds={sounds} />
            </div>
        )}
        <div className={cn(
            "flex items-center gap-2 p-2",
             isOpen && "border-t border-white/20"
            )}>
             <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 hover:text-white rounded-full" 
                onClick={() => setIsOpen(!isOpen)}
              >
                <ChevronUp className={cn("transition-transform", isOpen && "rotate-180")} />
                <span className="sr-only">{isOpen ? 'Close' : 'Open'} Sound Mixer</span>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={cycleBackground}>
                <ImageIcon />
                <span className="sr-only">Change Background</span>
            </Button>
        </div>
      </Card>
    </div>
  );
}
