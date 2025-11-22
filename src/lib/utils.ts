import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a document ID for a given user and date.
 * @param userId - The ID of the user.
 * @param date - The date string (e.g., "August 3, 2025").
 * @returns The document ID.
 */
export function getDocId(userId: string, date: string): string {
  // Firestore document IDs are case-sensitive and cannot contain slashes.
  return `${userId}-${date.replace(/, /g, '-')}`;
}
