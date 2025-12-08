
"use client";

import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import SoundscapeMixer from './SoundscapeMixer';
import { sounds } from '@/lib/sounds';
import { useBackground } from '@/context/BackgroundContext';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';


export default function ControlPanel() {
  const { cycleBackground } = useBackground();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
      <Card className="bg-black/30 backdrop-blur-md border border-white/20 shadow-lg rounded-full">
        <div className="flex items-center gap-2 p-2">
            <SoundscapeMixer sounds={sounds} />
            <div className="h-10 border-l border-white/20 mx-2"></div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={cycleBackground}>
                <ImageIcon />
                <span className="sr-only">Change Background</span>
            </Button>
        </div>
      </Card>
    </div>
  );
}
