"use client";
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { Video } from '@/lib/videos';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface VideoSelectorProps {
  videos: Video[];
  onSelect: (url: string) => void;
}

export default function VideoSelector({ videos, onSelect }: VideoSelectorProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap py-4">
      <div className="flex w-max space-x-4 p-4">
        {videos.map((video) => {
          const thumbnailUrl = PlaceHolderImages.find(p => p.id === video.thumbnailId)?.imageUrl || '';
          return (
            <Card key={video.id} onClick={() => onSelect(video.url)} className="cursor-pointer hover:border-primary transition-colors w-[300px] shrink-0">
              <CardContent className="p-0 relative aspect-video">
                <Image
                  src={thumbnailUrl}
                  alt={video.name}
                  fill
                  sizes="300px"
                  className="object-cover rounded-t-lg"
                  data-ai-hint={video.thumbnailHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h3 className="absolute bottom-2 left-3 text-white font-semibold">{video.name}</h3>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
