import { PracticeItem, VocabularyItem } from "@/lib/types";

type GeneratePracticeListParams = {
  vocabularyList: VocabularyItem[];
  searchParams: URLSearchParams;
  loading: boolean;
};

export function generatePracticeList({
  vocabularyList,
  searchParams,
  loading,
}: GeneratePracticeListParams): PracticeItem[] {
  if (loading || !vocabularyList || vocabularyList.length === 0) return [];

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

  dueForReview.sort((a, b) => {
    const timeDiff =
      new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
    return timeDiff || (a.accuracy ?? 0) - (b.accuracy ?? 0);
  });

  const practicePool = [...dueForReview];
  const addNewWordsCount = Math.min(
    newWords.length,
    Math.max(1, Math.floor(amount * 0.2))
  );

  if (practicePool.length < amount)
    practicePool.push(...newWords.slice(0, addNewWordsCount));
  if (practicePool.length < amount) {
    learningNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
    practicePool.push(...learningNotDue);
  }
  if (practicePool.length < amount) {
    masteredNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
    practicePool.push(...masteredNotDue);
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
  });

  switch (exerciseType) {
    case "flashcards":
      return selectedWords.map((w) => toItem(w, "guess"));
    case "writing":
      return selectedWords.map((w) => toItem(w, "write"));
    default:
      return selectedWords
        .flatMap((w) => [toItem(w, "guess"), toItem(w, "write")])
        .sort(() => Math.random() - 0.5);
  }
}
