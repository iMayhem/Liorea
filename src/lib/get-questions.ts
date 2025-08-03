// src/lib/get-questions.ts
import type { Question } from './types';

export async function getQuestions(subject: string, chapter: string, type: string): Promise<Question[]> {
  let fileName = type;
  
  // This logic correctly maps the URL slug to the corresponding file name.
  if (type === 'topic-wise-questions') {
      fileName = 'topic-wise';
  } else if (type === 'neet-rankers-stuff') {
      fileName = 'neet-rankers';
  } else if (type === 'neet-flashback') {
      fileName = 'neet-flashback';
  }

  try {
    // Dynamically import the question module based on the path from the URL slugs.
    const questionModule = await import(`@/lib/questions/${subject}/${chapter}/${fileName}.ts`);
    return questionModule.default || [];
  } catch (error) {
    console.warn(`No question set found for: ${subject}/${chapter}/${type}. Attempted to load ${fileName}.ts. Error:`, error);
    return [];
  }
}
