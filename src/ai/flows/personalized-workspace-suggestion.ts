'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized workspace environment suggestions.
 *
 * The flow takes task, mood, and focus level as input and suggests an optimal soundscape mix.
 *
 * @exported personalizedWorkspaceSuggestion - The main function to trigger the flow.
 * @exported PersonalizedWorkspaceSuggestionInput - The input type for the personalizedWorkspaceSuggestion function.
 * @exported PersonalizedWorkspaceSuggestionOutput - The output type for the personalizedWorkspaceSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWorkspaceSuggestionInputSchema = z.object({
  task: z.string().describe('The task the user is working on.'),
  mood: z.string().describe('The current mood of the user.'),
  focusLevel: z.string().describe('The desired focus level (e.g., high, medium, low).'),
});
export type PersonalizedWorkspaceSuggestionInput = z.infer<typeof PersonalizedWorkspaceSuggestionInputSchema>;

const PersonalizedWorkspaceSuggestionOutputSchema = z.object({
  soundscapeMixSuggestion: z.string().describe('Suggested soundscape mix for the workspace.'),
});
export type PersonalizedWorkspaceSuggestionOutput = z.infer<typeof PersonalizedWorkspaceSuggestionOutputSchema>;

export async function personalizedWorkspaceSuggestion(input: PersonalizedWorkspaceSuggestionInput): Promise<PersonalizedWorkspaceSuggestionOutput> {
  return personalizedWorkspaceSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWorkspaceSuggestionPrompt',
  input: {schema: PersonalizedWorkspaceSuggestionInputSchema},
  output: {schema: PersonalizedWorkspaceSuggestionOutputSchema},
  prompt: `You are an AI assistant designed to suggest optimal workspace environments.

  Based on the user's task, mood, and desired focus level, recommend a soundscape mix to enhance their concentration and productivity.

  Task: {{{task}}}
  Mood: {{{mood}}}
  Focus Level: {{{focusLevel}}}

  Consider a serene palette of blues and greens, complemented by warm accent lighting, when making your suggestions.

  Soundscape Mix Suggestion: `,
});

const personalizedWorkspaceSuggestionFlow = ai.defineFlow(
  {
    name: 'personalizedWorkspaceSuggestionFlow',
    inputSchema: PersonalizedWorkspaceSuggestionInputSchema,
    outputSchema: PersonalizedWorkspaceSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
