
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
import { Skeleton } from '@/components/ui/skeleton';


type ExerciseType = 'guess' | 'write';
type PracticeItem = {
    wordData: VocabularyItem;
    type: ExerciseType;
};

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
  const [completedCount, setCompletedCount] = useState(0);
  
  useEffect(() => {
      if(initialPracticeList.length > 0) {
          setPracticeList(initialPracticeList);
      }
  }, [initialPracticeList]);

  const totalItems = useMemo(() => initialPracticeList.length, [initialPracticeList]);

  const progressPercentage = totalItems > 0 ? ((completedCount) / totalItems) * 100 : 0;
  const currentItem = practiceList[currentIndex];

  const handleNext = (isCorrect: boolean, quality?: number) => {
    
    // Spaced Repetition System (SRS) update logic
    if (quality !== undefined) {
      const item = currentItem.wordData;
      const now = new Date();
      let newAccuracy = item.accuracy;
      if (item.repetitions > 0) {
        newAccuracy = (1 - item.alpha) * item.accuracy + item.alpha * (quality / 5);
      } else {
        newAccuracy = quality / 5;
      }

      const updates: Partial<VocabularyItem> = {
        lastQuality: quality,
        repetitions: item.repetitions + 1,
        accuracy: newAccuracy,
        lastReviewedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      
      // Basic SM-2 like interval calculation
      let nextInterval;
      if (item.repetitions === 1) {
        nextInterval = 1;
      } else if (item.repetitions === 2) {
        nextInterval = 6;
      } else {
        nextInterval = Math.ceil(item.repetitions * 2.5 * newAccuracy);
      }

      if (quality < 3) {
        nextInterval = 1; // Repeat tomorrow if score is low
      }
      
      const nextReviewDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);
      updates.nextReviewAt = nextReviewDate.toISOString();
      
      if (newAccuracy > 0.9 && item.repetitions > 5) {
        updates.status = 'mastered';
      } else {
        updates.status = 'learning';
      }
      
      updateVocabularyItem(item.id, updates);
    }
    
    // Session progress logic
    if (isCorrect) {
        setCompletedCount(prev => prev + 1);
    } else {
        // Re-add the failed item to the end of the list
        setPracticeList(prev => [...prev, currentItem]);
    }

    if (currentIndex + 1 < practiceList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
       if (completedCount + (isCorrect ? 1 : 0) >= totalItems) {
            setSessionFinished(true);
       } else {
            setCurrentIndex(prev => prev + 1);
       }
    }
  };

  useEffect(() => {
    if(completedCount >= totalItems && totalItems > 0) {
        if (currentIndex >= practiceList.length) {
            setSessionFinished(true);
        }
    }
  }, [completedCount, totalItems, currentIndex, practiceList.length]);

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
            <p className="text-muted-foreground mb-4">You completed {totalItems} exercises. Keep up the great work!</p>
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
          {completedCount} / {totalItems}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        {currentItem.type === 'guess' && <Flashcard wordData={currentItem.wordData} onNext={handleNext} />}
        {currentItem.type === 'write' && <WritingCard wordData={currentItem.wordData} onNext={handleNext} />}
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
