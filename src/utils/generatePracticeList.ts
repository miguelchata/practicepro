
import type { PracticeItem, VocabularyItem } from "@/lib/types";

type GeneratePracticeListParams = {
  vocabularyList: VocabularyItem[];
  searchParams: URLSearchParams;
};

export function generatePracticeList({
  vocabularyList,
  searchParams,
}: GeneratePracticeListParams): PracticeItem[] {
  if (!vocabularyList || vocabularyList.length === 0) return [];

  const amount = Number(searchParams.get("amount") || 10);
  const exerciseType = searchParams.get("type") || "both";
  const now = Date.now();

  const dueForReview: VocabularyItem[] = [];
  const newWords: VocabularyItem[] = [];
  const learningNotDue: VocabularyItem[] = [];
  const masteredNotDue: VocabularyItem[] = [];

  for (const item of vocabularyList) {
    const nextReviewTime = item.nextReviewAt
      ? new Date(item.nextReviewAt).getTime()
      : Infinity;
    if (item.repetitions === 0) newWords.push(item);
    else if (nextReviewTime <= now) dueForReview.push(item);
    else if (item.status === "learning") learningNotDue.push(item);
    else masteredNotDue.push(item);
  }

  // Prioritize due for review
  dueForReview.sort((a, b) => {
    const timeDiff =
      new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
    return timeDiff || (a.accuracy ?? 0) - (b.accuracy ?? 0);
  });

  const practicePool: VocabularyItem[] = [...dueForReview];

  // Add new words, up to 20% of the target amount
  const addNewWordsCount = Math.min(newWords.length, Math.max(1, Math.floor(amount * 0.2)));
  if (practicePool.length < amount) {
    practicePool.push(...newWords.slice(0, addNewWordsCount));
  }
  
  // Fill the rest with not-due learning words
  if (practicePool.length < amount) {
    learningNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
    practicePool.push(...learningNotDue.slice(0, amount - practicePool.length));
  }
  
  // If still not enough, fill with mastered words
  if (practicePool.length < amount) {
    masteredNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
    practicePool.push(...masteredNotDue.slice(0, amount - practicePool.length));
  }

  const selectedWords = practicePool
    .slice(0, amount)
    .sort(() => Math.random() - 0.5);

  const toItem = (
    wordData: VocabularyItem,
    type: "guess" | "write"
  ): PracticeItem => ({
    wordData,
    type,
    completed: false,
    sessionAttempts: 0,
    sessionConsecutiveFails: 0,
    recentQualities: [],
  });

  switch (exerciseType) {
    case "flashcards":
      return selectedWords.map((w) => toItem(w, "guess"));
    case "writing":
      return selectedWords.map((w) => toItem(w, "write"));
    default:
       // For 'both', we want to create one of each type, not duplicate the pool
       const half = Math.ceil(selectedWords.length / 2);
       const guessWords = selectedWords.slice(0, half);
       const writeWords = selectedWords.slice(half);
       
       const guessItems = guessWords.map(w => toItem(w, 'guess'));
       const writeItems = writeWords.map(w => toItem(w, 'write'));
       
       return [...guessItems, ...writeItems].sort(() => Math.random() - 0.5);
  }
}
