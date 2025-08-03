// src/lib/get-questions.ts
import type { Question } from './types';

export async function getQuestions(subject: string, chapter: string, type: string): Promise<Question[]> {
  // The slugs from the URL (e.g., 'topic-wise-questions') do not always match
  // the filenames (e.g., 'topic-wise.ts'). This map ensures the correct
  // filename is used for each quiz type.
  let fileName = type;
  if (type === 'topic-wise-questions') {
      fileName = 'topic-wise';
  } else if (type === 'neet-rankers-stuff') {
      fileName = 'neet-rankers';
  }
  // 'neet-flashback' slug already matches its filename.

  try {
    // Dynamically import the question module based on the correct filename.
    const questionModule = await import(`@/lib/questions/${subject}/${chapter}/${fileName}.ts`);
    return questionModule.default || [];
  } catch (error) {
    console.warn(`No question set found for: ${subject}/${chapter}/${type}. Attempted to load ${fileName}.ts. Error:`, error);
    // Return an empty array if the question file doesn't exist to prevent crashes.
    return [];
  }
}
