// src/ai/flows/explain-answer-flow.ts
'use server';
/**
 * @fileOverview An AI flow to solve and explain a quiz question.
 *
 * - explainAnswer - A function that provides an explanation for a question.
 * - ExplainAnswerInput - The input type for the explainAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {googleAI} from '@genkit-ai/googleai';

// Define the schema for the input data.
const ExplainAnswerInputSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z.any().describe('The available options for the question.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

// Define the schema for the output data.
const ExplainAnswerOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A clear and concise explanation that first states the correct option and then explains the reasoning.'
    ),
});

// Define the Genkit prompt for the AI model.
const explanationPrompt = ai.definePrompt({
  name: 'explanationPrompt',
  input: {
    schema: ExplainAnswerInputSchema,
  },
  output: {
    schema: ExplainAnswerOutputSchema,
  },
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `
    You are an expert tutor for the NEET exam.
    Your task is to read the following question and options, determine the correct answer, and provide a clear, concise explanation.

    Question: {{{questionText}}}

    Options:
    {{#each options}}
    - {{@key}}: {{{this}}}
    {{/each}}

    First, state the correct option key (e.g., "A", "B", "C", or "D"). Then, provide a helpful explanation for why that answer is correct. Focus on the core concepts.
  `,
});


// Define the Genkit flow.
const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async (input) => {
    // Convert options object to a more parsable format for the prompt if needed
    const {output} = await explanationPrompt(input);
    return output!;
  }
);


// Define the exported wrapper function to be called from the client.
export async function explainAnswer(
  input: ExplainAnswerInput
): Promise<string> {
  const result = await explainAnswerFlow(input);
  return result.explanation;
}
