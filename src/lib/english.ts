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

/* Tunable constants */
const MASTERED_INTERVAL_DAYS = 21;
const LEARNING_INTERVAL_DEFAULT = 1;
const MAX_INTERVAL_DAYS = 60;
const POOR_QUALITY_THRESHOLD = 1; // <= this is considered a poor attempt
const MASTERED_ACCURACY_THRESHOLD = 0.8;
const UNMASTERED_DROP_THRESHOLD = 0.6;
const MIN_REPETITIONS_FOR_MASTER = 5;
const RECENT_POOR_WINDOW_DAYS = 14;

/* EWMA/decay defaults and guards */
const DEFAULT_ALPHA = 0.25;
const DEFAULT_DECAY_RATE = 0.12; // per day
const REVIEW_THRESHOLD = 0.7; // T
const SMALL_RELEARN_MINUTES = 10; // when q < 3, next review this many minutes later
const LEECH_THRESHOLD = 8;
const MIN_DECAY_RATE = 0.01; // avoid lambda=0

export const updateWordStats = (
  item: VocabularyItem,
  quality: number,
  currentPracticeItem: PracticeItem,
  updateVocabularyItem: ReturnType<typeof useUpdateVocabularyItem>
): VocabularyItem => {
  function daysBetween(a: Date, b: Date) {
    return Math.abs((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
  }

  const now = new Date();
  const nowIsoStr = now.toISOString();

  // --- 0) Defaults from item (use your fields)
  const alpha = typeof item.alpha === "number" ? item.alpha : DEFAULT_ALPHA;
  const decayRate = Math.max(
    MIN_DECAY_RATE,
    typeof item.decayRate === "number" ? item.decayRate : DEFAULT_DECAY_RATE
  );
  const threshold =
    typeof item.threshold === "number" ? item.threshold : REVIEW_THRESHOLD;

  const lastReviewDate = item.lastReviewedAt
    ? new Date(item.lastReviewedAt)
    : now;
  const daysSinceLastReview = daysBetween(now, lastReviewDate);

  // --- 1) Compute decayed strength at review time (S_pred)
  const S_last = typeof item.accuracy === "number" ? item.accuracy : 0.5;
  const S_pred = S_last * Math.exp(-decayRate * daysSinceLastReview);

  // --- 2) EWMA update (quality normalized to r in [0,1])
  const r = Math.max(0, Math.min(1, quality / 5));
  const S_new = Math.max(0, Math.min(1, alpha * r + (1 - alpha) * S_pred));

  // --- 3) recent-poor aggregation (kept from your original logic)
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

  // --- 4) Update counters (repetitions now counts successful reviews)
  const prevReps = typeof item.repetitions === "number" ? item.repetitions : 0;
  const prevConsec =
    typeof item.consecutiveSuccesses === "number"
      ? item.consecutiveSuccesses
      : 0;
  let newRepetitions = prevReps;
  let newConsecutiveSuccesses = prevConsec;
  if (quality >= 3) {
    newRepetitions = prevReps + 1;
    newConsecutiveSuccesses = prevConsec + 1;
  } else {
    newConsecutiveSuccesses = 0;
  }

  // --- 5) Leech handling
  const prevLeech = typeof item.leechCount === "number" ? item.leechCount : 0;
  let newLeechCount = prevLeech;
  if (quality < 3) {
    newLeechCount = prevLeech + 1;
  } else {
    newLeechCount = Math.max(0, prevLeech - 1); // slowly decrement on success
  }

  // --- 6) Scheduling: compute nextReviewAt
  const clampDays = (d: number) =>
    Math.min(MAX_INTERVAL_DAYS, Math.max(0, Math.round(d)));

  let nextReviewAtIso: string;
  if (quality < 3) {
    // poor result: force short relearn
    nextReviewAtIso = new Date(
      now.getTime() + SMALL_RELEARN_MINUTES * 60 * 1000
    ).toISOString();
  } else {
    // success: compute days until S_new decays to threshold
    if (S_new <= threshold) {
      // already below threshold => due now (or schedule next day)
      nextReviewAtIso = now.toISOString();
    } else if (decayRate <= 0) {
      // fallback if decayRate misconfigured
      nextReviewAtIso = new Date(
        now.getTime() + LEARNING_INTERVAL_DEFAULT * 24 * 60 * 60 * 1000
      ).toISOString();
    } else {
      const t_next_days = (-1 / decayRate) * Math.log(threshold / S_new);
      const t_capped = clampDays(t_next_days);
      const effectiveDays = Math.max(LEARNING_INTERVAL_DEFAULT, t_capped);
      nextReviewAtIso = new Date(
        now.getTime() + effectiveDays * 24 * 60 * 60 * 1000
      ).toISOString();
    }
  }

  // --- 7) Compose updates to persist
  const updates: Partial<VocabularyItem> = {
    lastQuality: quality,
    accuracy: S_new,
    alpha: alpha,
    decayRate: decayRate,
    threshold: threshold,
    lastReviewedAt: nowIsoStr,
    updatedAt: nowIsoStr,
    recentAttempts: unified,
    leechCount: newLeechCount,
    consecutiveSuccesses: newConsecutiveSuccesses,
    repetitions: newRepetitions,
    nextReviewAt: nextReviewAtIso,
  };

  // Mastery promotion/demotion logic
  if (
    newConsecutiveSuccesses >= MIN_REPETITIONS_FOR_MASTER &&
    S_new >= MASTERED_ACCURACY_THRESHOLD
  ) {
    updates.status = "mastered";
    updates.nextReviewAt = new Date(
      now.getTime() + MASTERED_INTERVAL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
  } else if (
    item.status === "mastered" &&
    (S_new < UNMASTERED_DROP_THRESHOLD ||
      (hasTwoPoorRecentReviews &&
        daysSinceLastReview <= RECENT_POOR_WINDOW_DAYS))
  ) {
    updates.status = "learning";
    updates.nextReviewAt = new Date(
      now.getTime() + LEARNING_INTERVAL_DEFAULT * 24 * 60 * 60 * 1000
    ).toISOString();
  } else {
    updates.status = "learning";
    // nextReviewAt already computed from EWMA schedule above
  }

  // Optional: adapt decayRate slowly (heuristic)
  const ADAPT_DECAY_ENABLED = true;
  if (ADAPT_DECAY_ENABLED) {
    let newDecay = decayRate;
    if (newConsecutiveSuccesses >= 3) {
      newDecay = Math.max(MIN_DECAY_RATE, decayRate * 0.9);
    } else if (quality < 3) {
      newDecay = Math.min(0.5, decayRate * 1.1);
    }
    updates.decayRate = newDecay;
  }

  // Persist to backend
  updateVocabularyItem(item.id, updates);

  // Return locally merged item for immediate UI reaction
  return { ...item, ...updates } as VocabularyItem;
};
