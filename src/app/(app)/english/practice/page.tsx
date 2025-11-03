
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

const vocabularyList = [
  {
    word: 'ephemeral',
    type: 'Adjective',
    definition: 'Lasting for a very short time.',
    examples: [
      'The beauty of the cherry blossoms is ephemeral.',
      'His success as a singer was ephemeral.'
    ],
    learned: true,
    ipa: '/ɪˈfɛmərəl/'
  },
  {
    word: 'ubiquitous',
    type: 'Adjective',
    definition: 'Present, appearing, or found everywhere.',
    examples: [
        'Smartphones have become ubiquitous in modern society.',
        'The company\'s logo is ubiquitous, appearing on everything from billboards to coffee mugs.'
    ],
    learned: true,
    ipa: '/juːˈbɪkwɪtəs/'
  },
  {
    word: 'mellifluous',
    type: 'Adjective',
    definition: 'A sound that is sweet and musical; pleasant to hear.',
    examples: [
        'Her mellifluous voice captivated the audience.',
        'The mellifluous tones of the cello filled the room.'
    ],
    learned: false,
    ipa: '/məˈlɪfluəs/'
  },
  {
    word: 'pulchritudinous',
    type: 'Adjective',
    definition: 'Having great physical beauty.',
    examples: [
        'The pulchritudinous landscape was breathtaking.',
        'She was a pulchritudinous woman who turned heads wherever she went.'
    ],
    learned: false,
    ipa: '/ˌpʌlkrɪˈtjuːdɪnəs/'
  },
];

type WordData = (typeof vocabularyList)[0];
type ExerciseType = 'guess' | 'write';
type PracticeItem = {
    wordData: WordData;
    type: ExerciseType;
};

function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPracticeList: PracticeItem[] = useMemo(() => {
    const amount = parseInt(searchParams.get('amount') || '10', 10);
    const exerciseType = searchParams.get('type') || 'both';
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
  }, [searchParams]);
  
  const [practiceList, setPracticeList] = useState<PracticeItem[]>(initialPracticeList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  
  const totalItems = useMemo(() => initialPracticeList.length, [initialPracticeList]);

  const progressPercentage = totalItems > 0 ? ((completedCount) / totalItems) * 100 : 0;
  const currentItem = practiceList[currentIndex];

  const handleNext = (isCorrect?: boolean) => {
    let wasCorrect = isCorrect !== false;

    // If it's a flashcard, it's always "correct" for progress purposes
    if (currentItem.type === 'guess') {
      wasCorrect = true;
    }

    if (wasCorrect) {
        setCompletedCount(prev => prev + 1);
    } else {
        // Re-add the failed item to the end of the list
        setPracticeList(prev => [...prev, currentItem]);
    }

    if (currentIndex + 1 < practiceList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
       // We've reached the end of the current list.
       // Check if all original items have been completed.
       if (completedCount >= totalItems) {
            setSessionFinished(true);
       } else {
            // There are still items that were failed and re-added.
            // This case might happen if the last card is failed.
            // The next render will pick up the updated practiceList.
            setCurrentIndex(prev => prev + 1);
       }
    }
  };

  useEffect(() => {
    // This effect handles the case where all original items are completed, but we are not at the end of the practiceList yet.
    if(completedCount >= totalItems && totalItems > 0) {
        setSessionFinished(true);
    }
  }, [completedCount, totalItems]);


  if (sessionFinished) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-4">You completed {completedCount} exercises. Keep up the great work!</p>
            <Button onClick={() => router.push('/english')}>
                Back to Vocabulary
            </Button>
        </div>
    );
  }

  if (!currentItem) {
      // This can happen when the session finishes, before the sessionFinished state update renders.
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
