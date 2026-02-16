
'use client';

import { type DocumentReference, type Transaction } from "firebase/firestore";
import type { UserProfile } from './types';


/**
 * Updates the user's practice streak based on the last practice date.
 * @param transaction - The Firestore transaction.
 * @param userProfileRef - The reference to the user's profile document.
 */
export async function updateUserStreak(transaction: Transaction, userProfileRef: DocumentReference) {
    const userProfileDoc = await transaction.get(userProfileRef);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!userProfileDoc.exists()) {
        // If the profile doesn't exist, we create it now.
        // We can't know the exact email/name here easily, so we set defaults
        // that will be merged if they already exist or set if not.
        transaction.set(userProfileRef, {
            currentStreak: 1,
            lastPracticeDate: todayStr,
        }, { merge: true });
        return;
    }

    const userProfile = userProfileDoc.data() as UserProfile;
    const lastPracticeDateStr = userProfile.lastPracticeDate || '';

    if (lastPracticeDateStr === todayStr) {
        // Already practiced today, do nothing.
        return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Handle cases where `currentStreak` might be null or undefined on older documents
    let newStreak = userProfile.currentStreak || 0;

    if (lastPracticeDateStr === yesterdayStr) {
        // Practiced yesterday, increment streak.
        newStreak++;
    } else {
        // Didn't practice yesterday, reset streak to 1.
        newStreak = 1;
    }

    transaction.update(userProfileRef, {
        currentStreak: newStreak,
        lastPracticeDate: todayStr,
    });
}
