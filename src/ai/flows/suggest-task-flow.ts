// src/ai/flows/suggest-task-flow.ts
'use server';
/**
 * @fileOverview A flow for suggesting a study task.
 *
 * - suggestTask - A function that returns a study task suggestion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TaskSuggestionOutputSchema = z.object({
  task: z.string().describe('A short, actionable study task.'),
});
export type TaskSuggestionOutput = z.infer<typeof TaskSuggestionOutputSchema>;


export async function suggestTask(): Promise<string> {
  const result = await suggestTaskFlow();
  // Add a defensive check to prevent crashes if the AI response is unexpected.
  return result?.task || '';
}

const prompt = ai.definePrompt({
  name: 'suggestTaskPrompt',
  // Use the model name as a string; Genkit will use the configured Google AI plugin.
  model: 'gemini-1.5-flash',
  output: {schema: TaskSuggestionOutputSchema},
  prompt: `You are a friendly and encouraging study coach. Suggest a short, actionable study task for a student to add to their to-do list. The task should be something that can be accomplished in a single study session. Keep it concise and motivating.`,
});

const suggestTaskFlow = ai.defineFlow(
  {
    name: 'suggestTaskFlow',
    outputSchema: TaskSuggestionOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output || { task: '' };
  }
);
