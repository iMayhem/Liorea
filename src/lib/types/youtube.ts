// src/lib/types/youtube.ts
'use client';

import { z } from 'zod';

export const YoutubeSearchInputSchema = z.object({
  query: z.string().describe('The search query for YouTube.'),
});
export type YoutubeSearchInput = z.infer<typeof YoutubeSearchInputSchema>;

const VideoSchema = z.object({
    videoId: z.string(),
    title: z.string(),
    thumbnail: z.string(),
});

export const YoutubeSearchOutputSchema = z.object({
  videos: z.array(VideoSchema).describe('A list of YouTube video results.'),
});
export type YoutubeSearchOutput = z.infer<typeof YoutubeSearchOutputSchema>;
