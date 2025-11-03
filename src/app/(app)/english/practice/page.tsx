
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
  AlertDialogTrigger,
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
};

const MAX_CARDS_PER_SESSION = 20;

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

  const handleNext = (quality: number): number => {
    const item = currentItem.wordData;
    const now = new Date();
    
    const newRepetitions = item.repetitions + 1;
    
    let newAccuracy = item.accuracy;
    if (item.repetitions > 0) {
      newAccuracy = (1 - item.alpha) * item.accuracy + item.alpha * (quality / 5);
    } else {
      newAccuracy = quality / 5;
    }
    
    const updates: Partial<VocabularyItem> = {
      lastQuality: quality,
      repetitions: newRepetitions,
      accuracy: newAccuracy,
      lastReviewedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    const oneDay = 24 * 60 * 60 * 1000;
    
    const twoRecentQualities = (currentItem.recentQualities || []).slice(-1).concat(quality);
    const hasTwoPoorRecentReviews = twoRecentQualities.filter(q => q <= 1).length >= 2;
    const lastReviewDate = item.lastReviewedAt ? new Date(item.lastReviewedAt) : now;
    const daysSinceLastReview = (now.getTime() - lastReviewDate.getTime()) / oneDay;

    if (newRepetitions >= 5 && newAccuracy >= 0.80) {
        updates.status = 'mastered';
        updates.nextReviewAt = new Date(now.getTime() + 21 * oneDay).toISOString();
    } else if (
        item.status === 'mastered' &&
        (newAccuracy < 0.60 || (hasTwoPoorRecentReviews && daysSinceLastReview <= 14))
    ) {
        updates.status = 'learning';
        updates.nextReviewAt = new Date(now.getTime() + oneDay).toISOString();
    } else {
        updates.status = 'learning';
        let nextIntervalDays = 1;
        if (quality >= 3) {
          nextIntervalDays = Math.pow(2, Math.max(0, item.repetitions - 1));
        }
        updates.nextReviewAt = new Date(now.getTime() + nextIntervalDays * oneDay).toISOString();
    }
    
    updateVocabularyItem(item.id, updates);
    
    const isCorrect = quality >= 4;
    if (!isCorrect) {
        setPracticeList(prev => {
            if (prev.length < MAX_CARDS_PER_SESSION) {
                const updatedFailedItem: PracticeItem = {
                    ...currentItem,
                    recentQualities: [...(currentItem.recentQualities || []), quality]
                };
                return [...prev, updatedFailedItem];
            }
            return prev;
        });
    }
    
    return newAccuracy;
  };

  const advanceSession = () => {
    if (currentIndex + 1 < practiceList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
    }
  };


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
          {currentIndex + 1} / {totalItems}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        {currentItem.type === 'guess' && <Flashcard wordData={currentItem.wordData} onNext={handleNext} onAdvance={advanceSession} />}
        {currentItem.type === 'write' && <WritingCard wordData={currentItem.wordData} onNext={handleNext} onAdvance={advanceSession} />}
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
