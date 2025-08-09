// src/lib/firestore.ts
'use server';

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp, increment, orderBy, limit, Timestamp, deleteField } from 'firebase/firestore';
import type { UserProgress, TimeTableData, UserQuizProgress, UserProfile, PreparationPath, PrivateChatMessage } from './types';
import { generateInitialProgressForDate } from './data';
import { getDocId } from './utils';
import { format, startOfDay, endOfDay } from 'date-fns';


/**
 * Retrieves a user's progress for a specific date from Firestore.
 * If no progress exists, it initializes it based on the timetable.
 * @param username - The unique username of the user.
 * @param date - The date string (e.g., "August 3, 2025").
 * @param timetable - The timetable for the given date.
 * @returns The user's progress.
 */
export async function getProgressForUser(
  username: string,
  date: string,
  timetable: TimeTableData
): Promise<UserProgress> {
  const docId = getDocId(username, date);
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
 * @param username - The unique username of the user.
 * @param date - The date string.
 * @param subject - The subject name.
 * @param task - The task ID (e.g., "lecture").
 * @param isCompleted - The new completion status.
 */
export async function updateTask(
  username: string,
  date: string,
  subject: string,
  task: string,
  isCompleted: boolean
): Promise<void> {
  const docId = getDocId(username, date);
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
 * @param username - The unique username of the user.
 * @param date - The date string.
 * @param subject - The subject name.
 * @param score - The score to save.
 */
export async function updateScore(
  username: string,
  date: string,
  subject: string,
  score: number
): Promise<void> {
    const docId = getDocId(username, date);
    const docRef = doc(db, 'progress', docId);

    // Use dot notation to update only the score field of a specific subject
    const fieldPath = `${date}.${subject}.score`;

    // We use updateDoc here for clarity, but setDoc with merge would also work.
    await setDoc(docRef, {[fieldPath]: score}, {merge: true});
}


/**
 * Saves a user's quiz attempt for a specific question.
 * @param username - The unique username of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param quizType - The type of quiz (e.g., 'topic-wise-questions').
 * @param questionNumber - The number of the question.
 * @param selectedOption - The option selected by the user.
 * @param isCorrect - Whether the selected option was correct.
 */
export async function saveQuizAttempt(
  username: string,
  subjectSlug: string,
  chapterSlug: string,
  quizType: string,
  questionNumber: number,
  selectedOption: string,
  isCorrect: boolean
): Promise<void> {
  const docRef = doc(db, 'quiz_progress', `${username}_${quizType}`);

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
 * @param username - The unique username of the user.
 * @param quizType - The type of quiz.
 * @returns The user's quiz progress, or an empty object if none exists.
 */
export async function getQuizProgress(username: string, quizType: string): Promise<UserQuizProgress> {
    const docRef = doc(db, 'quiz_progress', `${username}_${quizType}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserQuizProgress;
    } else {
        return {};
    }
}

/**
 * Toggles the bookmark status for a specific question.
 * @param username - The unique username of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param quizType - The type of quiz (e.g., 'topic-wise-questions').
 * @param questionNumber - The number of the question.
 * @param isBookmarked - The new bookmark status.
 */
export async function toggleBookmark(
    username: string,
    subjectSlug: string,
    chapterSlug: string,
    quizType: string,
    questionNumber: number,
    isBookmarked: boolean
): Promise<void> {
    const docRef = doc(db, 'quiz_progress', `${username}_${quizType}`);
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
 * @param username - The unique username of the user.
 * @param subjectSlug - The slug of the subject.
 * @param chapterSlug - The slug of the chapter.
 * @param quizType - The type of quiz.
 * @returns The updated quiz progress for the entire quiz type.
 */
export async function resetQuizProgress(
    username: string,
    subjectSlug: string,
    chapterSlug: string,
    quizType: string
): Promise<UserQuizProgress> {
    const docRef = doc(db, 'quiz_progress', `${username}_${quizType}`);
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
 * @param uid - The ID of the user.
 * @returns An object mapping date strings to total study seconds.
 */
export async function getStudyLogsForUser(uid: string): Promise<Record<string, number>> {
  const docRef = doc(db, 'studyLogs', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().daily || {};
  }
  return {};
}

/**
 * Creates or updates a user's profile information. If a document for the UID doesn't exist, it creates one.
 * It does not create duplicate profiles based on email.
 * @param uid - The user's unique ID from Firebase Auth.
 * @param data - The data to set or merge.
 */
export async function upsertUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    // Document exists, update it with new data
    await setDoc(userRef, data, { merge: true });
  } else {
    // Document doesn't exist, check for existing email before creating
    if(data.email) {
      const q = query(collection(db, 'users'), where('email', '==', data.email));
      const emailQuerySnap = await getDocs(q);
      if(!emailQuerySnap.empty) {
        // Email already exists, don't create a new user profile
        console.warn(`Attempted to create a new profile for an existing email: ${data.email}`);
        return; 
      }
    }
    
    // Document doesn't exist, create it with initial values
    await setDoc(userRef, {
      ...data, // provided data (uid, email, photoURL)
      username: null, // Explicitly set username to null initially
      totalStudyHours: 0,
      dailyStreak: 0,
      mockScores: [],
      preparationPath: null,
      createdAt: serverTimestamp(),
      status: { isStudying: false, isJamming: false, roomId: null },
    }, { merge: true });
  }
}

// Helper to convert Firestore data to a plain object
const toPlainObject = (data: any) => {
    if (!data) return data;
    const plainData = { ...data };
    for (const key in plainData) {
        if (plainData[key] instanceof Timestamp) {
            plainData[key] = plainData[key].toDate().toISOString();
        }
    }
    return plainData;
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
        const userData = docSnap.data();
        return toPlainObject(userData) as UserProfile;
    }
    return null;
}

/**
 * Retrieves all user profiles from the 'users' collection.
 * @returns An array of user profile objects.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('username'));
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        users.push(toPlainObject({ ...doc.data(), uid: doc.id }) as UserProfile);
    });
    return users;
}


/**
 * Updates a user's profile with partial data. This function will create the document if it doesn't exist.
 * @param uid - The user's ID.
 * @param data - The partial data to update or set.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    // Use set with merge:true to either update an existing doc or create a new one if it doesn't exist.
    await setDoc(userRef, data, { merge: true });
}


/**
 * Checks if a username is unique.
 * @param username The username to check.
 * @returns A boolean indicating if the username is unique.
 */
export async function checkUsernameUnique(username: string): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

/**
 * Sets the preparation path for a user.
 * @param uid - The user's ID.
 * @param path - The chosen preparation path.
 */
export async function setUserPreparationPath(uid: string, path: PreparationPath): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { preparationPath: path });
}


/**
 * Fetches and ranks users for the leaderboard based on study hours.
 * @param type - The type of leaderboard ('study-hours-all-time' or 'study-hours-daily').
 * @returns A promise that resolves to an array of ranked UserProfile objects.
 */
export async function getLeaderboardData(type: 'study-hours-all-time' | 'study-hours-daily'): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  let q;

  if (type === 'study-hours-all-time') {
    q = query(usersRef, orderBy('totalStudyHours', 'desc'));
  } else {
    // For daily, we'll have to fetch all users and calculate on the client.
    // This is not ideal for performance with many users, but necessary without server-side aggregation.
    q = query(usersRef);
  }

  const querySnapshot = await getDocs(q);
  let users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as UserProfile;
    users.push(toPlainObject({ ...data, uid: doc.id }) as UserProfile);
  });

  if (type === 'study-hours-daily') {
      const now = new Date();
      const dayStart = startOfDay(now);
      const dayEnd = endOfDay(now);

      const dailyUsers = await Promise.all(users.map(async (user) => {
          const studyLogRef = doc(db, 'studyLogs', user.uid);
          const studyLogSnap = await getDoc(studyLogRef);
          let dailyHours = 0;
          if (studyLogSnap.exists()) {
              const dailyData = studyLogSnap.data().daily || {};
              for (const dateStr in dailyData) {
                  const logDate = new Date(dateStr);
                  if (logDate >= dayStart && logDate <= dayEnd) {
                      dailyHours += dailyData[dateStr];
                  }
              }
          }
          return { ...user, totalStudyHours: dailyHours };
      }));

      users = dailyUsers.sort((a, b) => (b.totalStudyHours || 0) - (a.totalStudyHours || 0));
  }
  
  return users;
}


/**
 * Sends a private message between two users.
 * Creates a chat room document if one doesn't exist.
 * @param senderId - The UID of the message sender.
 * @param receiverId - The UID of the message receiver.
 * @param text - The content of the message.
 * @param imageUrl - Optional URL of an image to send.
 * @param replyTo - Optional object containing info about the message being replied to.
 */
export async function sendPrivateMessage(
    senderId: string,
    receiverId: string,
    text: string,
    imageUrl: string | null = null,
    replyTo: { id: string, text: string } | null = null
): Promise<void> {
    const chatRoomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
    const messagesRef = collection(db, 'privateChats', chatRoomId, 'messages');
    
    const messageData: any = {
        text,
        imageUrl,
        senderId,
        receiverId,
        timestamp: serverTimestamp(),
    };

    if (replyTo) {
        messageData.replyToId = replyTo.id;
        messageData.replyToText = replyTo.text;
    }

    await addDoc(messagesRef, messageData);
}

/**
* Retrieves the last message from a private chat room.
* @param chatRoomId - The ID of the chat room.
* @returns The last message object or null if no messages exist.
*/
export async function getLastPrivateMessage(chatRoomId: string): Promise<PrivateChatMessage | null> {
    const messagesRef = collection(db, 'privateChats', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const messageData = docSnap.data();
        return toPlainObject({ id: docSnap.id, ...messageData }) as PrivateChatMessage;
    }
    return null;
}

/**
 * Creates or updates a report in the 'reports' collection.
 * @param reportData The data for the report.
 */
export async function submitReport(reportData: {
    userId: string;
    username: string;
    title: string;
    description: string;
    imageUrl?: string | null;
}) {
    await addDoc(collection(db, "reports"), {
        ...reportData,
        timestamp: serverTimestamp(),
        status: 'open', // Default status
    });
}
