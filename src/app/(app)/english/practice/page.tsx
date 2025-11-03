
'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
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
} from '@/components/ui/alert-dialog';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { useUpdateVocabularyItem } from '@/firebase/firestore/use-vocabulary';
import type { VocabularyItem } from '@/lib/types';


type ExerciseType = 'guess' | 'write';
type PracticeItem = {
    wordData: VocabularyItem;
    type: ExerciseType;
    // Keep track of recent qualities for lapse detection
    recentQualities?: number[];
    sessionAttempts?: number;
    sessionConsecutiveFails?: number;
    lastShownAt?: number;
};

const MAX_CARDS_PER_SESSION = 20;
const MAX_PER_CARD_PER_SESSION = 2; // new max
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


  const initialPracticeList: PracticeItem[] = useMemo(() => {
    if (loading) return [];
    const amount = parseInt(searchParams.get('amount') || '10', 10);
    const exerciseType = searchParams.get('type') || 'both';

    // For now, let's just take a slice. Later, this could be smarter (e.g., based on nextReviewAt)
    const words = vocabularyList.slice(0, amount);

    if (exerciseType === 'flashcards') {
        return words.map(wordData => ({ wordData, type: 'guess' }));
    }
    if (exerciseType === 'writing') {
        return words.map(wordData => ({ wordData, type: 'write' }));
    }
    // 'both'
    return words.flatMap(wordData => ([
        { wordData, type: 'guess' },
        { wordData, type: 'write' },
    ]));
  }, [searchParams, vocabularyList, loading]);
  
  const [practiceList, setPracticeList] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  
  useEffect(() => {
      if(initialPracticeList.length > 0) {
          setPracticeList(initialPracticeList);
      }
  }, [initialPracticeList]);

  const totalItems = useMemo(() => practiceList.length, [practiceList]);
  const progressPercentage = totalItems > 0 ? ((currentIndex) / totalItems) * 100 : 0;
  const currentItem = practiceList[currentIndex];


  const handleCardAdvance = async (quality: number, exerciseType: ExerciseType) => {
    if (!currentItem) return;

    function daysBetween(a: Date, b: Date) {
        return Math.abs((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
    }
    
    const item = currentItem.wordData;
    const now = new Date();
    const nowIsoStr = now.toISOString();
  
    // --- 1) EWMA update ---
    const newRepetitions = (item.repetitions || 0) + 1;
    const alpha = item.alpha ?? 0.2;
    let newAccuracy: number;
    if ((item.repetitions ?? 0) > 0) {
      newAccuracy = (1 - alpha) * (item.accuracy ?? 0) + alpha * (quality / 5);
    } else {
      newAccuracy = quality / 5;
    }
    newAccuracy = Math.max(0, Math.min(1, newAccuracy));
  
    // --- 2) recent-poor detection ---
    const persisted = item.recentAttempts ?? [];
    const inMemoryNums = currentItem.recentQualities ?? [];
    const inMemoryMapped = inMemoryNums.map(q => ({ quality: q, at: nowIsoStr }));
    const unified = [...persisted.slice(-5), ...inMemoryMapped].slice(-5);
    const poorRecent = unified.filter(a => a.quality <= POOR_QUALITY_THRESHOLD && daysBetween(new Date(a.at), now) <= RECENT_POOR_WINDOW_DAYS);
    const hasTwoPoorRecentReviews = poorRecent.length >= 2;
    const lastReviewDate = item.lastReviewedAt ? new Date(item.lastReviewedAt) : now;
    const daysSinceLastReview = daysBetween(now, lastReviewDate);
  
    // --- 3) status & nextReviewAt rules (unchanged) ---
    const updates: Partial<VocabularyItem> = {
      lastQuality: quality,
      repetitions: newRepetitions,
      accuracy: newAccuracy,
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
  
    if (newRepetitions >= MIN_REPETITIONS_FOR_MASTER && newAccuracy >= MASTERED_ACCURACY_THRESHOLD) {
      updates.status = 'mastered';
      updates.nextReviewAt = new Date(now.getTime() + MASTERED_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    } else if (
      item.status === 'mastered' &&
      (newAccuracy < UNMASTERED_DROP_THRESHOLD || (hasTwoPoorRecentReviews && daysSinceLastReview <= RECENT_POOR_WINDOW_DAYS))
    ) {
      updates.status = 'learning';
      updates.nextReviewAt = new Date(now.getTime() + LEARNING_INTERVAL_DEFAULT * 24 * 60 * 60 * 1000).toISOString();
    } else {
      updates.status = 'learning';
      const nextIntervalDays = computeLearningIntervalDays(item.repetitions ?? 0, quality);
      updates.nextReviewAt = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString();
    }
  
    // Persist once
    await updateVocabularyItem(item.id, updates);
  
    // --- 4) improved requeue rules with MAX_PER_CARD_PER_SESSION = 2 ---
    const previousSessionAttempts = currentItem.sessionAttempts ?? 0;
    const sessionAttempts = previousSessionAttempts + 1;
  
    let shouldRequeue = false;
    if (quality <= POOR_QUALITY_THRESHOLD) { // e.g. 1
      shouldRequeue = sessionAttempts < MAX_PER_CARD_PER_SESSION;
    } else if (quality < 5) { // e.g. 3
      shouldRequeue = previousSessionAttempts === 0 && sessionAttempts < MAX_PER_CARD_PER_SESSION;
    }

    if (shouldRequeue) {
        const updatedPracticeItem: PracticeItem = {
          ...currentItem,
          sessionAttempts: sessionAttempts,
          recentQualities: [...(currentItem.recentQualities ?? []), quality],
        };
        setPracticeList(prev => [...prev, updatedPracticeItem]);
    }

    if (currentIndex + 1 < practiceList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
    }
  }


  if (loading || (practiceList.length === 0 && !sessionFinished)) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center">
            <p>Preparing your session...</p>
        </div>
      )
  }

  if (sessionFinished) {
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
          {Math.min(currentIndex + 1, totalItems)} / {totalItems}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        {currentItem.type === 'guess' && <Flashcard wordData={currentItem.wordData} onAdvance={(q) => handleCardAdvance(q, 'guess')} />}
        {currentItem.type === 'write' && <WritingCard wordData={currentItem.wordData} onAdvance={(q) => handleCardAdvance(q, 'write')} />}
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
