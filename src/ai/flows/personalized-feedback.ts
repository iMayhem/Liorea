// src/ai/flows/personalized-feedback.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized feedback to users based on their task completion data.
 *
 * - personalizedFeedback - A function that generates personalized feedback for a user.
 * - PersonalizedFeedbackInput - The input type for the personalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the personalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  taskCompletionData: z
    .string()
    .describe(
      'A string representing the user task completion data.  This data should contain information about attended lectures, notes taken, homework completed and revisions done for each subject and day.'
    ),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe('Personalized feedback for the user, highlighting areas of improvement in study habits and consistency.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function personalizedFeedback(input: PersonalizedFeedbackInput): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const personalizedFeedbackPrompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are a personalized learning assistant, adept at analyzing student task completion data and providing actionable feedback.

  Based on the following task completion data, generate personalized feedback for the student, highlighting areas where they can improve their study habits and consistency. Be specific and provide concrete suggestions.

  Task Completion Data:
  {{taskCompletionData}}
  `,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await personalizedFeedbackPrompt(input);
    return output!;
  }
);
