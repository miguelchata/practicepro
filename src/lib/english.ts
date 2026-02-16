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
const SESSION_FAIL_WINDOW_MS = 3 * 1000 * 60;
const REPEATED_FAIL_ALPHA = 0.05;

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
): VocabularyItem => {
  function daysBetween(a: Date, b: Date) {
    return Math.abs((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
  }

  const now = new Date();
  const nowIsoStr = now.toISOString();

  // --- 0) Defaults from item
  const baseAlpha = typeof item.alpha === "number" ? item.alpha : DEFAULT_ALPHA;
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

  let alpha = baseAlpha;
  if (quality === 3) alpha = 0.9;
  else if (quality === 4) alpha = 0.4;
  else if (quality === 5) alpha = 0.5;

  // --- 2) EWMA update (quality normalized to r in [0,1])
  const r = Math.max(0, Math.min(1, quality / 5));
  const S_new = Math.max(0, Math.min(1, alpha * r + (1 - alpha) * S_pred));

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
      // already below threshold => due now
      nextReviewAtIso = now.toISOString();
    } else if (decayRate <= 0) {
      // fallback
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
    leechCount: newLeechCount,
    consecutiveSuccesses: newConsecutiveSuccesses,
    repetitions: newRepetitions,
    nextReviewAt: nextReviewAtIso,
  };

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

  return { ...item, ...updates } as VocabularyItem;
};
