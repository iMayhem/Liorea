// src/ai/flows/explain-answer-flow.ts
'use server';
/**
 * @fileOverview An AI flow to explain why a quiz answer is incorrect.
 *
 * - explainAnswer - A function that provides an explanation for a wrong answer.
 * - ExplainAnswerInput - The input type for the explainAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {googleAI} from '@genkit-ai/googleai';

// Define the schema for the input data.
const ExplainAnswerInputSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z.any().describe('The available options for the question.'),
  selectedAnswer: z.string().describe("The user's selected (incorrect) answer."),
  correctAnswer: z.string().describe('The correct answer.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

// Define the schema for the output data.
const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation.'),
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
    You are an expert tutor for the NEET exam. A student has answered a question incorrectly.
    Your task is to provide a clear, concise explanation for why their answer is wrong and why the correct answer is right.

    Question: {{{questionText}}}

    Options:
    {{#each options}}
    - {{this}}
    {{/each}}

    Student's Incorrect Answer: {{{selectedAnswer}}}
    Correct Answer: {{{correctAnswer}}}

    Please provide a helpful explanation. Be encouraging and focus on the core concepts.
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
