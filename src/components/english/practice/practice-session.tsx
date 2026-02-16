'use client';

import { useContext } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { VocabularyList } from '@/components/english/vocabulary-list';
import { PracticeContext } from '@/context/practice-context';
import { useFirestore, useUser } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { updateUserStreak } from '@/lib/streak';

export function PracticeSession() {
  const router = useRouter();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const context = useContext(PracticeContext);
  
  if (!context) {
    throw new Error('PracticeSession must be used within a PracticeProvider');
  }

  const {
    state,
    active,
    handleFeedback,
    goToNext,
  } = context;

  const {
    activeId,
    completedCount,
    totalCount,
    sessionFinished,
    practicedItems,
    practiceItems
  } = state;

  const handleFinishSession = async () => {
    if (!firestore || !user) {
        router.push('/practice');
        return;
    }
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const userProfileRef = doc(firestore, 'users', user.uid);
            await updateUserStreak(transaction, userProfileRef);
        });
    } catch (error) {
        console.error("Failed to update streak:", error);
    } finally {
        router.push('/practice');
    }
  };

  if (sessionFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-[100dvh]">
        <Card className="w-full max-w-2xl max-h-full overflow-hidden flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-2xl font-bold font-headline mb-2">
              Session Complete!
            </CardTitle>
            <CardDescription>
              You completed your review session. Here's a summary of the words
              you practiced.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-4">
            <VocabularyList items={practicedItems.map((p) => p.wordData)} />
          </CardContent>
          <CardContent className="shrink-0 pt-4">
            <Button onClick={handleFinishSession} className="w-full h-12 text-lg">
              Back to Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (practiceItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-[100dvh]">
        <h2 className="text-2xl font-bold font-headline mb-2">
          No Words to Practice
        </h2>
        <p className="text-muted-foreground mb-4">
          There are no words matching your criteria. Try adding new words or
          wait for your next review cycle.
        </p>
        <Button onClick={() => router.push('/practice')} size="lg">
          Back to Practice
        </Button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[100dvh]">
        <p className="animate-pulse">Loading next card...</p>
      </div>
    );
  }

  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
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
              <AlertDialogAction onClick={() => router.push('/practice')}>
                Quit Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex-1 flex flex-col justify-center">
            <Progress value={progressPercentage} className="h-2 w-full" />
        </div>
        <div className="text-xs font-bold font-mono text-muted-foreground tabular-nums shrink-0">
          {completedCount} / {totalCount}
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            {active.type === 'guess' ? (
              <Flashcard
                practiceItem={active}
                handleFeedback={handleFeedback}
                nextCard={() => goToNext()}
              />
            ) : (
              <WritingCard
                practiceItem={active}
                handleFeedback={handleFeedback}
                nextCard={() => goToNext()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
