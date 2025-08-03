// src/lib/get-questions.ts
import type { Question } from './types';

export async function getQuestions(subject: string, chapter: string, type: string): Promise<Question[]> {
  let questionModule;
  try {
    // Dynamically import the question module based on the path
    // The path is normalized to match the file names (e.g., 'neet-rankers-stuff' -> 'neet-rankers')
    const normalizedType = type.replace('-stuff', '').replace('-questions', '');
    questionModule = await import(`@/lib/questions/${subject}/${chapter}/${normalizedType}.ts`);
    return questionModule.default || [];
  } catch (error) {
    console.warn(`No question set found for: ${subject}/${chapter}/${type}. Error:`, error);
    return [];
  }
}