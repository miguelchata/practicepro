
'use client';

import { useRouter } from 'next/navigation';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updateWordStats } from '@/lib/english';
import { usePractice } from '@/hooks/use-practice';
import { motion, AnimatePresence } from 'framer-motion';
import type { PracticeItem } from '@/lib/types';
import { VocabularyList } from '@/components/english/vocabulary-list';

type PracticeSessionProps = {
  initialPracticeList: PracticeItem[];
};

export function PracticeSession({ initialPracticeList }: PracticeSessionProps) {
  console.log('PracticeSession initialPracticeList:', initialPracticeList);
  const router = useRouter();

  const {
    active,
    activeId,
    completedCount,
    totalCount,
    updateState,
    goToNext,
    sessionFinished,
    practicedItems,
  } = usePractice(initialPracticeList);

  const handleFeedback = async (quality: number) => {
    if (!active) return null;

    const updatedWordData = updateWordStats(active.wordData, quality);

    // The database update is now deferred to the "Continue" button action in each card component.
    updateState(updatedWordData);
    return updatedWordData;
  };

  if (sessionFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline mb-2">
              Session Complete!
            </CardTitle>
            <CardDescription>
              You completed your review session. Here's a summary of the words
              you practiced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VocabularyList items={practicedItems.map((p) => p.wordData)} />
          </CardContent>
          <CardContent>
            <Button onClick={() => router.push('/english')}>
              Back to Vocabulary
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialPracticeList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold font-headline mb-2">
          No Words to Practice
        </h2>
        <p className="text-muted-foreground mb-4">
          There are no words matching your criteria. Try adding new words or
          wait for your next review cycle.
        </p>
        <Button onClick={() => router.push('/english')}>
          Back to Vocabulary
        </Button>
      </div>
    );
  }

  if (!active) {
    // This can happen briefly between state transitions or if the list is empty initially.
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p>Loading next card...</p>
      </div>
    );
  }

  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
              <AlertDialogTitle>
                Are you sure you want to quit?
              </AlertDialogTitle>
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
          {completedCount} / {totalCount}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-hidden transition-opacity duration-300">
        <AnimatePresence mode="wait">
          {active.type === 'guess' && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="w-full max-w-xl"
            >
              <Flashcard
                practiceItem={active}
                handleFeedback={handleFeedback}
                nextCard={() => goToNext()}
              />
            </motion.div>
          )}
          {active.type === 'write' && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="w-full max-w-xl"
            >
              <WritingCard
                practiceItem={active}
                handleFeedback={handleFeedback}
                nextCard={() => goToNext()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
