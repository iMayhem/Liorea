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
        description: 'Search for YouTube videos based on a query.',
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
  },
  async (input) => {
     const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: `Find relevant YouTube videos for the query: ${input.query}. Prioritize music, podcasts, or study-related content.`,
        tools: [youtubeSearchTool],
        config: {
            temperature: 0.1, 
        }
    });
    
    // The LLM decides whether to call the tool based on the prompt.
    // We pass the user's raw query to the tool.
    if (llmResponse.hasToolRequest(youtubeSearchTool)) {
        return youtubeSearchTool(input);
    }
    
    // Fallback or if the model doesn't use the tool for some reason
    // which is unlikely given the prompt.
    return { results: [] };
  }
);
