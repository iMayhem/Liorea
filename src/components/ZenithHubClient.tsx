"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import VideoBackground from '@/components/layout/VideoBackground';
import DigitalClock from '@/components/clock/DigitalClock';
import PomodoroTimer from '@/components/timer/PomodoroTimer';
import ControlPanel from '@/components/controls/ControlPanel';
import { videos } from '@/lib/videos';

export default function ZenithHubClient() {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(videos[0].url);

  return (
    <>
      <VideoBackground src={selectedVideoUrl} />
      <Header />
      <main className="relative z-1 min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-8 text-center">
          <DigitalClock />
          <PomodoroTimer />
        </div>
      </main>
      <ControlPanel onVideoSelect={setSelectedVideoUrl} onSuggestionSelect={setSelectedVideoUrl} />
    </>
  );
}
