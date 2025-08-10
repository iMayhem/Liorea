// src/ai/flows/youtube-search.ts
'use server';
/**
 * @fileOverview A YouTube video search AI agent.
 *
 * - searchYoutube - A function that handles the video search process.
 */

import type { YoutubeSearchInput, YoutubeSearchOutput, YoutubeSearchResult } from '@/lib/types';

// This is the main function that will be called from the frontend.
export async function searchYoutube(input: YoutubeSearchInput): Promise<YoutubeSearchOutput> {
  // Directly call the search logic. No need for a complex flow here.
  
  const YOUTUBE_API_KEY = process.env.FIREBASE_API_KEY; // Using Firebase API key which has YouTube Data API enabled
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(input.query)}&maxResults=10&key=${YOUTUBE_API_KEY}`;
  
  try {
      const response = await fetch(url);
      if (!response.ok) {
          const errorText = await response.text();
          console.error('YouTube API Error:', errorText);
          throw new Error(`YouTube API request failed with status ${response.status}`);
      }
      const data = await response.json();

      // Ensure that data.items exists and is an array before mapping
      if (!data.items || !Array.isArray(data.items)) {
          console.warn('YouTube API returned no items.');
          return { results: [] };
      }

      const results: YoutubeSearchResult[] = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.high.url,
      }));
      
      return { results };
  } catch (error) {
      console.error('Failed to fetch from YouTube API', error);
      // Return empty results on failure
      return { results: [] };
  }
}
