'use server';
/**
 * @fileOverview A flow for searching YouTube videos.
 *
 * - searchYoutube - A function that takes a search query and returns a list of videos.
 * - YoutubeSearchInput - The input type for the searchYoutube function.
 * - YoutubeSearchOutput - The return type for the searchYoutube function.
 */

import { ai } from '@/ai/genkit';
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

const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not configured.');
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&key=${apiKey}&maxResults=10`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('YouTube API Error:', await response.text());
        throw new Error('Failed to fetch from YouTube API.');
      }
      const data = await response.json();
      
      const videos = data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
      }));

      return { videos };

    } catch (error) {
      console.error('Error in youtubeSearchFlow:', error);
      return { videos: [] };
    }
  }
);


export async function searchYoutube(input: YoutubeSearchInput): Promise<YoutubeSearchOutput> {
  return youtubeSearchFlow(input);
}
