
'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { Flashcard } from '@/components/english/flashcard';
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


function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = parseInt(searchParams.get('amount') || '10', 10);
  
  const practiceList = useMemo(() => {
    // In a real app, you'd filter based on user's learning status
    return vocabularyList.slice(0, amount);
  }, [amount]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);

  const progressPercentage = ((currentIndex + 1) / practiceList.length) * 100;
  const currentWordData = practiceList[currentIndex];

  const handleNext = () => {
    if (currentIndex < practiceList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
    }
  };

  if (sessionFinished) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-4">You reviewed {practiceList.length} words. Keep up the great work!</p>
            <Button onClick={() => router.push('/english')}>
                Back to Vocabulary
            </Button>
        </div>
    );
  }

  if (!currentWordData) {
      return <div>Loading...</div>
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
          {currentIndex + 1} / {practiceList.length}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Flashcard wordData={currentWordData} onNext={handleNext} />
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

    