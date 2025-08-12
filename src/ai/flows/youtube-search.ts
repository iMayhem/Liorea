'use server';
/**
 * @fileOverview A flow for searching YouTube videos.
 *
 * - searchYoutube - A function that takes a search query and returns a list of videos.
 */

import { ai } from '@/ai/genkit';
import { YoutubeSearchInputSchema, YoutubeSearchOutputSchema, type YoutubeSearchInput, type YoutubeSearchOutput } from '@/lib/types/youtube';

const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.YOUTUBE_API_KEY; // Corrected to use a specific YouTube API key
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured in the environment.');
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
