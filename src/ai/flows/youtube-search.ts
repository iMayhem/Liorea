// src/ai/flows/youtube-search.ts
'use server';
/**
 * @fileOverview A YouTube video search AI agent.
 *
 * - searchYoutube - A function that handles the video search process.
 * - YoutubeSearchInput - The input type for the searchYoutube function.
 * - YoutubeSearchOutput - The return type for the searchYoutube function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GoogleAuth } from 'google-auth-library';


const YoutubeSearchInputSchema = z.object({
  query: z.string().describe('The search query for YouTube videos.'),
});
export type YoutubeSearchInput = z.infer<typeof YoutubeSearchInputSchema>;

export const YoutubeSearchResultSchema = z.object({
    id: z.string().describe("The unique YouTube video ID."),
    title: z.string().describe("The title of the video."),
    thumbnailUrl: z.string().describe("The URL of the video's thumbnail image."),
});
export type YoutubeSearchResult = z.infer<typeof YoutubeSearchResultSchema>;

const YoutubeSearchOutputSchema = z.object({
    results: z.array(YoutubeSearchResultSchema).describe('A list of search results, should contain at least 5 videos.'),
});
export type YoutubeSearchOutput = z.infer<typeof YoutubeSearchOutputSchema>;

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
        prompt: `Find relevant YouTube videos for the query: ${input.query}. Prioritize music, podcasts, or study-related content.`,
        tools: [youtubeSearchTool],
        config: {
            temperature: 0.1, 
        }
    });

    const toolOutput = llmResponse.toolOutput(youtubeSearchTool);
    
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
