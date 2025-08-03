// src/ai/genkit.ts
import {genkit, type GenkitErrorCode} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit and configure the Google AI plugin.
// The plugin uses the GOOGLE_API_KEY environment variable.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
  // Log errors to the console.
  logSinks: [
    ({level, ...rest}) =>
      console.log(`[${level.toLowerCase()}] `, {...rest}),
  ],
  // Handle errors and return a structured response.
  errorHandler: async ({error}) => {
    const {message, name, stack} = error as Error;
    const code = (error as any).code as GenkitErrorCode | undefined;
    return {
      status: 'failure',
      errors: [{code, message, name, stack: stack?.split('\n')}],
    };
  },
});
