// src/components/ambient-sound-player.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, CloudRain, Flame } from 'lucide-react';
import type { SoundType } from '@/lib/types';
import { useStudyRoom } from '@/hooks/use-study-room';

export function AmbientSoundPlayer() {
  const { activeSound, handleSoundChange } = useStudyRoom();

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Music className="h-5 w-5" />
          Ambient Sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <Button
                variant={activeSound === 'rain' ? 'secondary' : 'outline'}
                onClick={() => handleSoundChange(activeSound === 'rain' ? 'none' : 'rain')}
                className="flex-1"
            >
                <CloudRain className="mr-2 h-4 w-4" />
                Rain
            </Button>
            <Button
                variant={activeSound === 'fire' ? 'secondary' : 'outline'}
                onClick={() => handleSoundChange(activeSound === 'fire' ? 'none' : 'fire')}
                className="flex-1"
            >
                <Flame className="mr-2 h-4 w-4" />
                Fire
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
