
'use client';

import { doc, getDoc, type DocumentReference, type Transaction } from "firebase/firestore";
import type { UserProfile } from './types';


/**
 * Updates the user's practice streak based on the last practice date.
 * @param transaction - The Firestore transaction.
 * @param userProfileRef - The reference to the user's profile document.
 */
export async function updateUserStreak(transaction: Transaction, userProfileRef: DocumentReference) {
    const userProfileDoc = await transaction.get(userProfileRef);
    
    if (!userProfileDoc.exists()) {
        // The profile should have been created at login/signup.
        // If it still doesn't exist, we can't create it in a read-after-write transaction.
        // We will log a warning and exit gracefully. The streak can be picked up on the next session.
        console.warn("User profile does not exist when trying to update streak. This should have been created at login.");
        return;
    }

    const userProfile = userProfileDoc.data() as UserProfile;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

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
