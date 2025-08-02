import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This prevents a memory leak in development by ensuring that the AI instance is only created once.
// In production, this check is not necessary, but it's good practice to keep it.
const g = global as any;

export const ai =
  g.ai ??
  genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });

if (process.env.NODE_ENV !== 'production') {
  g.ai = ai;
}
