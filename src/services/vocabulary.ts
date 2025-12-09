/**
 * @fileOverview Vocabulary data service for interacting with Firestore.
 */
import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import type { VocabularyItem } from '@/lib/types';

/**
 * Fetches all vocabulary items for a given user from Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user whose vocabulary to fetch.
 * @returns A promise that resolves to an array of vocabulary items.
 */
export async function getVocabularyForUser(
  firestore: Firestore,
  userId: string
): Promise<VocabularyItem[]> {
  try {
    const q = query(
      collection(firestore, 'vocabulary'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as VocabularyItem
    );
  } catch (error) {
    console.error('Error fetching vocabulary for user:', error);
    // In a real-world scenario, you might want to throw the error
    // or handle it more gracefully (e.g., return a result object with an error).
    return [];
  }
}
