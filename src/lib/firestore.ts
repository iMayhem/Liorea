// src/lib/firestore.ts
'use server';

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp, increment, orderBy, limit } from 'firebase/firestore';
import type { UserProgress, TimeTableData, UserQuizProgress, UserProfile } from './types';
import { generateInitialProgressForDate } from './data';
import { getDocId } from './utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';


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
 * @param quizType - The type of quiz (e.g., 'topic-wise-questions').
 * @param questionNumber - The number of the question.
 * @param selectedOption - The option selected by the user.
 * @param isCorrect - Whether the selected option was correct.
 */
export async function saveQuizAttempt(
  userId: string,
  subjectSlug: string,
  chapterSlug: string,
  quizType: string,
  questionNumber: number,
  selectedOption: string,
  isCorrect: boolean
): Promise<void> {
  const docRef = doc(db, 'quiz_progress', `${userId}_${quizType}`);

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
 * Retrieves a user's entire quiz progress for a specific quiz type.
 * @param userId - The ID of the user.
 * @param quizType - The type of quiz.
 * @returns The user's quiz progress, or an empty object if none exists.
 */
export async function getQuizProgress(userId: string, quizType: string): Promise<UserQuizProgress> {
    const docRef = doc(db, 'quiz_progress', `${userId}_${quizType}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserQuizProgress;
    } else {
        return {};
    }
}

/**
 * Toggles the bookmark status for a specific question.
 * @param userId - The ID of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param quizType - The type of quiz (e.g., 'topic-wise-questions').
 * @param questionNumber - The number of the question.
 * @param isBookmarked - The new bookmark status.
 */
export async function toggleBookmark(
    userId: string,
    subjectSlug: string,
    chapterSlug: string,
    quizType: string,
    questionNumber: number,
    isBookmarked: boolean
): Promise<void> {
    const docRef = doc(db, 'quiz_progress', `${userId}_${quizType}`);
    const fieldPath = `${subjectSlug}.${chapterSlug}.${questionNumber}.bookmarked`;

    await setDoc(
        docRef,
        {
            [subjectSlug]: {
                [chapterSlug]: {
                    [questionNumber]: {
                        bookmarked: isBookmarked,
                    },
                },
            },
        },
        { merge: true }
    );
}


/**
 * Resets a user's quiz progress for a specific chapter, preserving bookmarks.
 * @param userId - The ID of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param quizType - The type of quiz.
 * @returns The updated quiz progress for the entire quiz type.
 */
export async function resetQuizProgress(
    userId: string,
    subjectSlug: string,
    chapterSlug: string,
    quizType: string
): Promise<UserQuizProgress> {
    const docRef = doc(db, 'quiz_progress', `${userId}_${quizType}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return {}; // No progress to reset
    }

    const fullProgress = docSnap.data() as UserQuizProgress;
    const chapterProgress = fullProgress?.[subjectSlug]?.[chapterSlug];

    if (!chapterProgress) {
        return fullProgress; // No progress for this specific chapter
    }
    
    // Iterate over questions and remove 'selected' and 'isCorrect' fields
    Object.keys(chapterProgress).forEach(questionNumberStr => {
        const questionNumber = parseInt(questionNumberStr, 10);
        const attempt = chapterProgress[questionNumber];
        if (attempt) {
            delete attempt.selected;
            delete attempt.isCorrect;
            // If the question only had non-bookmark data, remove it entirely
            if (Object.keys(attempt).length === 0) {
                 delete chapterProgress[questionNumber];
            }
        }
    });

    // Update the document in Firestore
    await setDoc(docRef, fullProgress);

    return fullProgress;
}


/**
 * Logs a completed study session for all participants in a room.
 * It updates both the daily log and the all-time total.
 * @param participantUids - An array of user UIDs who were in the room.
 * @param durationInSeconds - The duration of the study session in seconds.
 */
export async function logStudySession(participantUids: string[], durationInSeconds: number) {
  if (durationInSeconds <= 0) return;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  for (const uid of participantUids) {
    // Update daily log
    const dailyLogRef = doc(db, 'studyLogs', uid);
    const fieldPath = `daily[${today}]`;
    await setDoc(dailyLogRef, { 
      daily: {
        [today]: increment(durationInSeconds) 
      }
    }, { merge: true });

    // Update total study hours in the user's profile
    const userProfileRef = doc(db, 'users', uid);
    await setDoc(userProfileRef, {
        totalStudyHours: increment(durationInSeconds)
    }, { merge: true });
  }
}

/**
 * Retrieves all study logs for a specific user.
 * @param userId - The ID of the user.
 * @returns An object mapping date strings to total study seconds.
 */
export async function getStudyLogsForUser(userId: string): Promise<Record<string, number>> {
  const docRef = doc(db, 'studyLogs', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().daily || {};
  }
  return {};
}

/**
 * Creates or updates a user's profile information.
 * @param user - The authenticated user object from Firebase Auth.
 */
export async function upsertUserProfile(user: { uid: string; username: string | null; photoURL: string | null; email: string | null; }) {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // Document doesn't exist, create it with default values
    await setDoc(userRef, {
      uid: user.uid,
      username: user.username,
      photoURL: user.photoURL,
      email: user.email,
      totalStudyHours: 0,
      dailyStreak: 0,
      mockScores: [],
      leaderboardVisibility: 'anonymous', // Default privacy setting
      createdAt: serverTimestamp(),
    });
  } else {
    // Document exists, update only the fields that might change on login
    await updateDoc(userRef, {
        username: user.username,
        photoURL: user.photoURL,
        email: user.email,
    });
  }
}

/**
 * Retrieves a user's profile from the 'users' collection.
 * @param uid - The user's ID.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

/**
 * Updates a user's profile with partial data.
 * @param uid - The user's ID.
 * @param data - The partial data to update.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}

/**
 * Fetches and ranks users for the leaderboard based on study hours.
 * @param type - The type of leaderboard ('study-hours-all-time' or 'study-hours-weekly').
 * @returns A promise that resolves to an array of ranked UserProfile objects.
 */
export async function getLeaderboardData(type: 'study-hours-all-time' | 'study-hours-weekly'): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  let q;

  if (type === 'study-hours-all-time') {
    q = query(usersRef, orderBy('totalStudyHours', 'desc'), limit(50));
  } else {
    // For weekly, we'll have to fetch all users and calculate on the client.
    // This is not ideal for performance with many users, but necessary without server-side aggregation.
    q = query(usersRef);
  }

  const querySnapshot = await getDocs(q);
  let users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    // Filter out users who want to be hidden
    const data = doc.data() as UserProfile;
    if (data.leaderboardVisibility !== 'hidden') {
      users.push({ ...data, uid: doc.id });
    }
  });

  if (type === 'study-hours-weekly') {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const weeklyUsers = await Promise.all(users.map(async (user) => {
          const studyLogRef = doc(db, 'studyLogs', user.uid);
          const studyLogSnap = await getDoc(studyLogRef);
          let weeklyHours = 0;
          if (studyLogSnap.exists()) {
              const dailyData = studyLogSnap.data().daily || {};
              for (const dateStr in dailyData) {
                  const logDate = new Date(dateStr);
                  if (logDate >= weekStart && logDate <= weekEnd) {
                      weeklyHours += dailyData[dateStr];
                  }
              }
          }
          return { ...user, totalStudyHours: weeklyHours };
      }));

      users = weeklyUsers.sort((a, b) => (b.totalStudyHours || 0) - (a.totalStudyHours || 0)).slice(0, 50);
  }
  
  return users;
}
