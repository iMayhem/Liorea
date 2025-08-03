// src/lib/get-questions.ts
import type { Question } from './types';

export async function getQuestions(subject: string, chapter: string, type: string): Promise<Question[]> {
  let questionModule;
  try {
    // Dynamically import the question module based on the path from the URL slugs.
    // e.g., /practice/biology/molecular-basis-of-inheritance/neet-flashback
    // will load  /lib/questions/biology/molecular-basis-of-inheritance/neet-flashback.ts
    questionModule = await import(`@/lib/questions/${subject}/${chapter}/${type}.ts`);
    return questionModule.default || [];
  } catch (error) {
    console.warn(`No question set found for: ${subject}/${chapter}/${type}. Error:`, error);
    return [];
  }
}
