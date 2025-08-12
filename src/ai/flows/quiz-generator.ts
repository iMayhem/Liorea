'use server';
/**
 * @fileOverview A flow for generating a practice quiz from PDF content.
 *
 * - generateQuizFromPdf - A function that takes PDF text and images and returns a structured quiz.
 * - GenerateQuizInput - The input type for the generateQuizFromPdf function.
 * - GeneratedQuizData - The return type for the generateQuizFromPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Question, GeneratedQuizData } from '@/lib/types';


// Define the schema for the output of a single question
const QuestionSchema = z.object({
  questionNumber: z.number().describe('The sequential number of the question.'),
  questionText: z.string().describe('The full text of the question.'),
  questionImageURL: z.string().optional().describe('The data URI of the image associated with this question, if any. Expected format: "data:image/jpeg;base64,..."'),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }).describe('The multiple-choice options for the question.'),
  correctAnswer: z.string().describe('The key of the correct option (e.g., "A", "B", "C", or "D").'),
});

// Define the schema for the input, which includes PDF text and an array of image data URIs
export const GenerateQuizInputSchema = z.object({
  pdfText: z.string().describe('The entire extracted text content of the PDF.'),
  images: z.array(z.string()).describe('An array of all images extracted from the PDF, each as a data URI. Expected format: "data:image/jpeg;base64,..."')
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Define the schema for the final quiz output
export const GeneratedQuizOutputSchema = z.object({
    title: z.string().describe("A suitable title for the generated quiz, based on the document's content."),
    questions: z.array(QuestionSchema).describe('An array of all questions extracted from the document.')
});

const generationPrompt = ai.definePrompt({
    name: 'pdfQuizGenerationPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GeneratedQuizOutputSchema },
    prompt: `You are an expert at creating practice quizzes from educational materials.
    Your task is to analyze the provided text and images extracted from a PDF document and generate a structured quiz in JSON format.

    Instructions:
    1.  Read through the provided PDF text content.
    2.  Identify all the multiple-choice questions in the text.
    3.  For each question, extract the question text, the options (A, B, C, D), and identify the correct answer.
    4.  Examine the provided images. If a question refers to a specific diagram or image, find the corresponding image from the image array and associate its data URI with the question. The images are provided as an array of data URIs.
    5.  Assign a sequential question number to each question.
    6.  Create a suitable title for the quiz based on the overall topic of the material.
    7.  Format the final output as a single JSON object that strictly follows the provided output schema.

    PDF Text:
    {{{pdfText}}}

    Available Images:
    {{#each images}}
    {{media url=this}}
    {{/each}}
    `
});

// Define the main flow for generating the quiz
const quizGenerationFlow = ai.defineFlow(
  {
    name: 'quizGenerationFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GeneratedQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz from PDF.');
    }
    return output;
  }
);


// Exported function to be called from the frontend
export async function generateQuizFromPdf(input: GenerateQuizInput): Promise<GeneratedQuizData> {
  const result = await quizGenerationFlow(input);
  return result;
}
