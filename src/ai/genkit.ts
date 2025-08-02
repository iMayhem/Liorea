import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import next from '@genkit-ai/next';

// This prevents a memory leak in development by ensuring that the AI instance is only created once.
// In production, this check is not necessary, but it's good practice to keep it.
const g = global as any;

export const ai =
  g.ai ??
  genkit({
    plugins: [
      googleAI({
        apiKey: process.env.GEMINI_API_KEY,
      }),
      next(), // The Next.js plugin is required for Genkit to work with Next.js.
    ],
    logLevel: 'debug',
    enableTracing: true,
  });

if (process.env.NODE_ENV !== 'production') {
  g.ai = ai;
}
