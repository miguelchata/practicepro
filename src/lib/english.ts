import { useUpdateVocabularyItem } from "@/firebase/firestore/use-vocabulary";

import type { VocabularyItem } from "@/lib/types";
type ExerciseType = "guess" | "write" | "both";
export type PracticeItem = {
  wordData: VocabularyItem;
  type: ExerciseType;
  sessionAttempts?: number;
  sessionConsecutiveFails?: number;
  recentQualities?: number[];
  lastShownAt?: number;
};

const MASTERED_INTERVAL_DAYS = 21;
const LEARNING_INTERVAL_DEFAULT = 1;
const MAX_INTERVAL_DAYS = 60;
const POOR_QUALITY_THRESHOLD = 1;
const MASTERED_ACCURACY_THRESHOLD = 0.8;
const UNMASTERED_DROP_THRESHOLD = 0.6;
const MIN_REPETITIONS_FOR_MASTER = 5;
const RECENT_POOR_WINDOW_DAYS = 14;

export const updateWordStats = async (
  item: VocabularyItem,
  quality: number,
  currentPracticeItem: PracticeItem,
  updateVocabularyItem: ReturnType<typeof useUpdateVocabularyItem>
): Promise<VocabularyItem> => {
  function daysBetween(a: Date, b: Date) {
    return Math.abs((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
  }

  const now = new Date();
  const nowIsoStr = now.toISOString();

  // --- 1) EWMA update ---
  const newRepetitions = (item.repetitions || 0) + 1;
  const alpha = item.alpha ?? 0.2;
  let newAccuracyValue: number;
  if ((item.repetitions ?? 0) > 0) {
    newAccuracyValue =
      (1 - alpha) * (item.accuracy ?? 0) + alpha * (quality / 5);
  } else {
    newAccuracyValue = quality / 5;
  }
  newAccuracyValue = Math.max(0, Math.min(1, newAccuracyValue));

  // --- 2) recent-poor detection ---
  const persisted = item.recentAttempts ?? [];
  const inMemoryNums = currentPracticeItem.recentQualities ?? [];
  const inMemoryMapped = inMemoryNums.map((q) => ({
    quality: q,
    at: nowIsoStr,
  }));
  const unified = [...persisted.slice(-5), ...inMemoryMapped].slice(-5);
  const poorRecent = unified.filter(
    (a) =>
      a.quality <= POOR_QUALITY_THRESHOLD &&
      daysBetween(new Date(a.at), now) <= RECENT_POOR_WINDOW_DAYS
  );
  const hasTwoPoorRecentReviews = poorRecent.length >= 2;
  const lastReviewDate = item.lastReviewedAt
    ? new Date(item.lastReviewedAt)
    : now;
  const daysSinceLastReview = daysBetween(now, lastReviewDate);

  // --- 3) status & nextReviewAt rules ---
  const updates: Partial<VocabularyItem> = {
    lastQuality: quality,
    repetitions: newRepetitions,
    accuracy: newAccuracyValue,
    lastReviewedAt: nowIsoStr,
    updatedAt: nowIsoStr,
    recentAttempts: unified,
  };

  const computeLearningIntervalDays = (baseReps: number, q: number) => {
    if (q >= 3) {
      const interval = Math.pow(2, Math.max(0, baseReps - 1));
      return Math.min(
        MAX_INTERVAL_DAYS,
        Math.max(LEARNING_INTERVAL_DEFAULT, Math.round(interval))
      );
    }
    return LEARNING_INTERVAL_DEFAULT;
  };

  if (
    newRepetitions >= MIN_REPETITIONS_FOR_MASTER &&
    newAccuracyValue >= MASTERED_ACCURACY_THRESHOLD
  ) {
    updates.status = "mastered";
    updates.nextReviewAt = new Date(
      now.getTime() + MASTERED_INTERVAL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
  } else if (
    item.status === "mastered" &&
    (newAccuracyValue < UNMASTERED_DROP_THRESHOLD ||
      (hasTwoPoorRecentReviews &&
        daysSinceLastReview <= RECENT_POOR_WINDOW_DAYS))
  ) {
    updates.status = "learning";
    updates.nextReviewAt = new Date(
      now.getTime() + LEARNING_INTERVAL_DEFAULT * 24 * 60 * 60 * 1000
    ).toISOString();
  } else {
    updates.status = "learning";
    const nextIntervalDays = computeLearningIntervalDays(
      item.repetitions ?? 0,
      quality
    );
    updates.nextReviewAt = new Date(
      now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  // Fire-and-forget the database update. Do not await it.
  await updateVocabularyItem(item.id, updates);

  // Return the locally updated item so the UI can react instantly
  return { ...item, ...updates };
};
