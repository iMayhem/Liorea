// src/lib/get-questions.ts
import type { Question } from './types';

export async function getQuestions(subject: string, chapter: string, type: string): Promise<Question[]> {
  // This function now uses the 'type' parameter directly from the URL slug
  // to construct the path to the question file. This avoids previous errors
  // caused by incorrect string manipulation.
  const fileName = type;

  try {
    const questionModule = await import(`@/lib/questions/${subject}/${chapter}/${fileName}.ts`);
    return questionModule.default || [];
  } catch (error) {
    console.warn(`No question set found for: ${subject}/${chapter}/${type}. Attempted to load ${fileName}.ts. Error:`, error);
    return [];
  }
}
