// src/ai/flows/youtube-search.ts
'use server';
/**
 * @fileOverview A YouTube video search AI agent.
 *
 * - searchYoutube - A function that handles the video search process.
 */

import { ai } from '@/ai/genkit';
import { GoogleAuth } from 'google-auth-library';
import type { YoutubeSearchInput, YoutubeSearchOutput, YoutubeSearchResult } from '@/lib/types';
import { YoutubeSearchInputSchema, YoutubeSearchOutputSchema } from '@/lib/types';


// This function is exported and can be called from your frontend code.
export async function searchYoutube(input: YoutubeSearchInput): Promise<YoutubeSearchOutput> {
  return youtubeSearchFlow(input);
}


const youtubeSearchTool = ai.defineTool(
    {
        name: 'youtubeSearch',
        description: 'Search for YouTube videos based on a query. Prioritize music, podcasts, or study-related content.',
        inputSchema: YoutubeSearchInputSchema,
        outputSchema: YoutubeSearchOutputSchema
    },
    async (input) => {
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
);


const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
    // By providing the tool here, Genkit knows it can use it.
    // The description in the tool definition guides the LLM on when to use it.
    tools: [youtubeSearchTool] 
  },
  async (input) => {
    // When the flow is called, Genkit automatically determines
    // if a tool should be used based on the input and the tool's description.
    // If it decides to use youtubeSearchTool, it will call it and return the output.
    // We don't need to manually check for tool requests.
    return await youtubeSearchTool(input);
  }
);
