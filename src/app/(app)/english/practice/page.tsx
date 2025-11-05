
'use client';

import { Suspense, useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { Flashcard } from '@/components/english/flashcard';
import { WritingCard } from '@/components/english/writing-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { useUpdateVocabularyItem } from '@/firebase/firestore/use-vocabulary';
import type { VocabularyItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';


type ExerciseType = 'guess' | 'write';
export type FeedbackState = 'idle' | 'showingResult' | 'showingAccuracy' | 'showingFinal';

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
const MASTERED_ACCURACY_THRESHOLD = 0.80;
const UNMASTERED_DROP_THRESHOLD = 0.60;
const MIN_REPETITIONS_FOR_MASTER = 5;
const RECENT_POOR_WINDOW_DAYS = 14;


function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: vocabularyList, loading } = useVocabulary();
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [isPending, startTransition] = useTransition();


  const initialPracticeList: PracticeItem[] = useMemo(() => {
    if (loading || vocabularyList.length === 0) return [];
    
    const amount = parseInt(searchParams.get('amount') || '10', 10);
    const exerciseType = searchParams.get('type') || 'both';
    const now = new Date();

    // 1. Separate words into buckets
    const dueForReview: VocabularyItem[] = [];
    const newWords: VocabularyItem[] = [];
    const learningNotDue: VocabularyItem[] = [];
    const masteredNotDue: VocabularyItem[] = [];

    vocabularyList.forEach(item => {
        if (item.repetitions === 0) {
            newWords.push(item);
        } else if (item.nextReviewAt && new Date(item.nextReviewAt) <= now) {
            dueForReview.push(item);
        } else if (item.status === 'learning') {
            learningNotDue.push(item);
        } else {
            masteredNotDue.push(item);
        }
    });

    // 2. Prioritize the practice pool
    // Sort due words: older reviews and lower accuracy first
    dueForReview.sort((a, b) => {
        const aDate = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
        const bDate = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
        if (aDate !== bDate) return aDate - bDate;
        return (a.accuracy ?? 0) - (b.accuracy ?? 0);
    });
    
    let practicePool = [...dueForReview];

    // 3. Fill up the pool if needed
    const addNewWordsCount = Math.min(newWords.length, Math.max(1, Math.floor(amount * 0.2)));
    if (practicePool.length < amount) {
        // Add a controlled number of new words
        practicePool.push(...newWords.slice(0, addNewWordsCount));
    }

    if (practicePool.length < amount) {
        // Add learning words, sorted by lowest accuracy
        learningNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
        practicePool.push(...learningNotDue);
    }
    
    if (practicePool.length < amount) {
        // Add mastered words if absolutely necessary, sorted by lowest accuracy
        masteredNotDue.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
        practicePool.push(...masteredNotDue);
    }

    // 4. Take the final slice and shuffle it
    let selectedWords = practicePool.slice(0, amount);
    selectedWords.sort(() => Math.random() - 0.5); // Shuffle the list

    // 5. Create exercise items
    if (exerciseType === 'flashcards') {
        return selectedWords.map(wordData => ({ wordData, type: 'guess' }));
    }
    if (exerciseType === 'writing') {
        return selectedWords.map(wordData => ({ wordData, type: 'write' }));
    }
    
    // 'both'
    const bothList = selectedWords.flatMap(wordData => ([
        { wordData, type: 'guess' },
        { wordData, type: 'write' },
    ]));
    // Shuffle again to mix up guess/write types
    bothList.sort(() => Math.random() - 0.5); 
    return bothList;

  }, [searchParams, vocabularyList, loading]);
  
  const [practiceList, setPracticeList] = useState<PracticeItem[]>([]);
  const [practiceIndexes, setPracticeIndexes] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [correctlyAnswered, setCorrectlyAnswered] = useState(0);

  // State for parent-controlled animation
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);
  
  
  useEffect(() => {
      if(initialPracticeList.length > 0) {
          setPracticeList(initialPracticeList);
          setPracticeIndexes(Array.from({ length: initialPracticeList.length }, (_, i) => i));
      }
  }, [initialPracticeList]);

  const currentItem = practiceList[practiceIndexes[currentIndex]];

  // This effect controls the animation sequence and card advancement
  useEffect(() => {
    if (feedbackState === 'idle' || !currentItem) return;

    let timer: NodeJS.Timeout;

    if (feedbackState === 'showingResult') { // For WritingCard
        timer = setTimeout(() => setFeedbackState('showingAccuracy'), 800);
    } else if (feedbackState === 'showingAccuracy') {
        const nextStep = currentItem.type === 'write' ? 'showingFinal' : 'idle';
        const delay = currentItem.type === 'write' ? 800 : 1200;
        timer = setTimeout(() => {
            if (nextStep === 'idle') {
                advanceToNextCard();
            } else {
                setFeedbackState(nextStep as FeedbackState);
            }
        }, delay);
    } else if (feedbackState === 'showingFinal') { // For WritingCard
        timer = setTimeout(() => {
            advanceToNextCard();
        }, 1200);
    }

    return () => clearTimeout(timer);
  }, [feedbackState, currentItem]);


  const totalItems = useMemo(() => practiceIndexes.length, [practiceIndexes]);

  const updateWordStats = (item: VocabularyItem, quality: number, currentPracticeItem: PracticeItem): VocabularyItem => {
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
      newAccuracyValue = (1 - alpha) * (item.accuracy ?? 0) + alpha * (quality / 5);
    } else {
      newAccuracyValue = quality / 5;
    }
    newAccuracyValue = Math.max(0, Math.min(1, newAccuracyValue));
  
    // --- 2) recent-poor detection ---
    const persisted = item.recentAttempts ?? [];
    const inMemoryNums = currentPracticeItem.recentQualities ?? [];
    const inMemoryMapped = inMemoryNums.map(q => ({ quality: q, at: nowIsoStr }));
    const unified = [...persisted.slice(-5), ...inMemoryMapped].slice(-5);
    const poorRecent = unified.filter(a => a.quality <= POOR_QUALITY_THRESHOLD && daysBetween(new Date(a.at), now) <= RECENT_POOR_WINDOW_DAYS);
    const hasTwoPoorRecentReviews = poorRecent.length >= 2;
    const lastReviewDate = item.lastReviewedAt ? new Date(item.lastReviewedAt) : now;
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
        const interval = Math.pow(2, Math.max(0, (baseReps - 1)));
        return Math.min(MAX_INTERVAL_DAYS, Math.max(LEARNING_INTERVAL_DEFAULT, Math.round(interval)));
      }
      return LEARNING_INTERVAL_DEFAULT;
    };
  
    if (newRepetitions >= MIN_REPETITIONS_FOR_MASTER && newAccuracyValue >= MASTERED_ACCURACY_THRESHOLD) {
      updates.status = 'mastered';
      updates.nextReviewAt = new Date(now.getTime() + MASTERED_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    } else if (
      item.status === 'mastered' &&
      (newAccuracyValue < UNMASTERED_DROP_THRESHOLD || (hasTwoPoorRecentReviews && daysSinceLastReview <= RECENT_POOR_WINDOW_DAYS))
    ) {
      updates.status = 'learning';
      updates.nextReviewAt = new Date(now.getTime() + LEARNING_INTERVAL_DEFAULT * 24 * 60 * 60 * 1000).toISOString();
    } else {
      updates.status = 'learning';
      const nextIntervalDays = computeLearningIntervalDays(item.repetitions ?? 0, quality);
      updates.nextReviewAt = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString();
    }
  
    // Fire-and-forget the database update. Do not await it.
    updateVocabularyItem(item.id, updates);

    // Return the locally updated item so the UI can react instantly
    return { ...item, ...updates };
  };

  const handleFeedback = (quality: number) => {
    if (feedbackState !== 'idle') return;

    const originalIndex = practiceIndexes[currentIndex];
    const updatedItem = updateWordStats(currentItem.wordData, quality, currentItem);
    
    // Update the item in the master list for this session
    setPracticeList(prev => prev.map((p, i) => (i === originalIndex ? { ...p, wordData: updatedItem } : p)));

    setNewAccuracy((updatedItem.accuracy ?? 0) * 100);
    
    // Kick off the animation sequence
    const nextState = currentItem.type === 'write' ? 'showingResult' : 'showingAccuracy';
    setFeedbackState(nextState);
  };

  const initialTotal = initialPracticeList.length;

  const advanceToNextCard = () => {
    const updatedItem = currentItem.wordData;
    
    let newIndexes = [...practiceIndexes];
    const newAccuracyValue = updatedItem.accuracy ?? 0;
    let isCorrect = false;

    if (newAccuracyValue >= 0.70) {
        newIndexes = practiceIndexes.filter((_, i) => i !== currentIndex);
        setCorrectlyAnswered(prev => prev + 1);
        isCorrect = true;
    }

    const newCorrectCount = correctlyAnswered + (isCorrect ? 1 : 0);
    if (newCorrectCount === initialTotal) {
      setSessionFinished(true);
      return;
    }

    if (newIndexes.length === 0) {
        setSessionFinished(true);
        return;
    }

    let nextIndex = currentIndex;
    if (newAccuracyValue >= 0.70) {
      if (currentIndex >= newIndexes.length) {
          nextIndex = 0;
      }
    } else {
        nextIndex = (currentIndex + 1) % newIndexes.length;
    }
    
    startTransition(() => {
        // Reset animation states for the next card
        setFeedbackState('idle');
        setNewAccuracy(null);
        setPracticeIndexes(newIndexes);
        setCurrentIndex(nextIndex);
    });
  };

  if (loading || (practiceList.length === 0 && !sessionFinished)) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center">
            <p>Preparing your session...</p>
        </div>
      )
  }

  if (sessionFinished || practiceIndexes.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-4">You completed your review session. Keep up the great work!</p>
            <Button onClick={() => router.push('/english')}>
                Back to Vocabulary
            </Button>
        </div>
    );
  }

  if (!currentItem) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <p>Loading next card...</p>
        </div>
      );
  }

  const progressPercentage = initialTotal > 0 ? (correctlyAnswered / initialTotal) * 100 : 0;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress in this session will not be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/english')}>
                Quit Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Progress value={progressPercentage} className="flex-1" />
        <div className="w-16 text-right font-semibold">
          {correctlyAnswered} / {initialTotal}
        </div>
      </header>
      <main className={`flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-hidden transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentItem.wordData.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
            >
                {currentItem.type === 'guess' && <Flashcard practiceItem={currentItem} handleFeedback={handleFeedback} feedbackState={feedbackState} newAccuracy={newAccuracy} />}
                {currentItem.type === 'write' && <WritingCard practiceItem={currentItem} handleFeedback={handleFeedback} feedbackState={feedbackState} newAccuracy={newAccuracy} />}
            </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}


export default function PracticePage() {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Suspense fallback={<div>Loading session...</div>}>
                <PracticeSession />
            </Suspense>
        </div>
    )
}

    

