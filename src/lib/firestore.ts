// src/lib/firestore.ts
'use server';

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProgress, TimeTableData, UserQuizProgress } from './types';
import { generateInitialProgressForDate } from './data';
import { getDocId } from './utils';


/**
 * Retrieves a user's progress for a specific date from Firestore.
 * If no progress exists, it initializes it based on the timetable.
 * @param userId - The ID of the user ('user1' or 'user2').
 * @param date - The date string (e.g., "August 3, 2025").
 * @param timetable - The timetable for the given date.
 * @returns The user's progress.
 */
export async function getProgressForUser(
  userId: string,
  date: string,
  timetable: TimeTableData
): Promise<UserProgress> {
  const docId = getDocId(userId, date);
  const docRef = doc(db, 'progress', docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  } else {
    // No data exists, so we'll create it.
    const initialProgress = generateInitialProgressForDate(timetable);
    await setDoc(docRef, initialProgress);
    return initialProgress;
  }
}

/**
 * Updates a specific task's completion status in Firestore.
 * @param userId - The ID of the user.
 * @param date - The date string.
 * @param subject - The subject name.
 * @param task - The task ID (e.g., "lecture").
 * @param isCompleted - The new completion status.
 */
export async function updateTask(
  userId: string,
  date: string,
  subject: string,
  task: string,
  isCompleted: boolean
): Promise<void> {
  const docId = getDocId(userId, date);
  const docRef = doc(db, 'progress', docId);

  // Firestore's dot notation allows us to update nested fields.
  const fieldToUpdate = `${date}.${subject}.${task}`;

  await setDoc(
    docRef,
    {
      [date]: {
        [subject]: {
          [task]: isCompleted,
        },
      },
    },
    { merge: true } // Use merge to avoid overwriting the whole document
  );
}


/**
 * Updates the score for a specific subject on a given date.
 * @param userId - The ID of the user.
 * @param date - The date string.
 * @param subject - The subject name.
 * @param score - The score to save.
 */
export async function updateScore(
  userId: string,
  date: string,
  subject: string,
  score: number
): Promise<void> {
    const docId = getDocId(userId, date);
    const docRef = doc(db, 'progress', docId);

    // Use dot notation to update only the score field of a specific subject
    const fieldPath = `${date}.${subject}.score`;

    // We use updateDoc here for clarity, but setDoc with merge would also work.
    await updateDoc(docRef, {
        [fieldPath]: score
    });
}


/**
 * Saves a user's quiz attempt for a specific question.
 * @param userId - The ID of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param questionNumber - The number of the question.
 * @param selectedOption - The option selected by the user.
 * @param isCorrect - Whether the selected option was correct.
 */
export async function saveQuizAttempt(
  userId: string,
  subjectSlug: string,
  chapterSlug: string,
  questionNumber: number,
  selectedOption: string,
  isCorrect: boolean
): Promise<void> {
  const docRef = doc(db, 'quiz_progress', userId);

  const fieldPath = `${subjectSlug}.${chapterSlug}.${questionNumber}`;

  await setDoc(
    docRef,
    {
      [subjectSlug]: {
        [chapterSlug]: {
          [questionNumber]: {
            selected: selectedOption,
            isCorrect: isCorrect,
          },
        },
      },
    },
    { merge: true }
  );
}


/**
 * Retrieves a user's entire quiz progress.
 * @param userId - The ID of the user.
 * @returns The user's quiz progress, or an empty object if none exists.
 */
export async function getQuizProgress(userId: string): Promise<UserQuizProgress> {
    const docRef = doc(db, 'quiz_progress', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserQuizProgress;
    } else {
        return {};
    }
}