
'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { Flashcard } from "@/components/english/flashcard";
import { WritingCard } from "@/components/english/writing-card";
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
} from "@/components/ui/alert-dialog";
import { useVocabulary } from "@/firebase/firestore/use-collection";
import { useUpdateVocabularyItem } from "@/firebase/firestore/use-vocabulary";
import { updateWordStats } from "@/lib/english";
import { usePractice } from "@/hooks/use-practice";
import { generatePracticeList } from "@/utils/generatePracticeList";
import { motion, AnimatePresence } from "framer-motion";
import type { PracticeItem, VocabularyItem } from "@/lib/types";

type UiState = 'LOADING' | 'PRACTICING' | 'EMPTY' | 'COMPLETED';

type PracticeSessionProps = {
  initialPracticeList: PracticeItem[];
};

function PracticeSession({ initialPracticeList }: PracticeSessionProps) {
  const router = useRouter();
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [uiState, setUiState] = useState<UiState>('LOADING');

  const {
    active,
    activeId,
    completedCount,
    totalCount,
    goToNext,
    sessionFinished,
  } = usePractice(initialPracticeList);

  const handleFeedback = async (quality: number) => {
    if (!active) return null;

    const updatedWordData = updateWordStats(
      active.wordData,
      quality
    );
    
    // Asynchronously update in the background
    updateVocabularyItem(updatedWordData.id, updatedWordData)

    return updatedWordData;
  };

  useEffect(() => {
    if (initialPracticeList === null) { // Still waiting for parent to load
        setUiState('LOADING');
    } else if (initialPracticeList.length === 0) {
        setUiState('EMPTY');
    } else {
        setUiState('PRACTICING');
    }
  }, [initialPracticeList]);

  useEffect(() => {
    if (sessionFinished && uiState === 'PRACTICING') {
      setUiState('COMPLETED');
    }
  }, [sessionFinished, uiState]);


  if (uiState === 'LOADING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold font-headline mb-2">
          Preparing your session...
        </h2>
        <p className="text-muted-foreground">Loading vocabulary...</p>
      </div>
    );
  }

  if (uiState === 'EMPTY') {
     return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold font-headline mb-2">
          No Words to Practice
        </h2>
        <p className="text-muted-foreground mb-4">
          There are no words matching your criteria. Try adding new words or wait for your next review cycle.
        </p>
        <Button onClick={() => router.push("/english")}>
          Back to Vocabulary
        </Button>
      </div>
    );
  }

  if (uiState === 'COMPLETED') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold font-headline mb-2">
          Session Complete!
        </h2>
        <p className="text-muted-foreground mb-4">
          You completed your review session. Keep up the great work!
        </p>
        <Button onClick={() => router.push("/english")}>
          Back to Vocabulary
        </Button>
      </div>
    );
  }

  if (uiState === 'PRACTICING' && !active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p>Loading next card...</p>
      </div>
    );
  }
  
  if (uiState === 'PRACTICING' && active) {
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
                <AlertDialogAction onClick={() => router.push("/english")}>
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
        <main
          className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-hidden transition-opacity duration-300"
        >
          <AnimatePresence mode="wait">
            {active.type === "guess" && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className="w-full max-w-xl"
              >
                <Flashcard
                  practiceItem={active}
                  handleFeedback={handleFeedback}
                  nextCard={(updatedItem: VocabularyItem) => goToNext(updatedItem)}
                />
              </motion.div>
            )}
            {active.type === "write" && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className="w-full max-w-xl"
              >
                <WritingCard
                  practiceItem={active}
                  handleFeedback={handleFeedback}
                  nextCard={(updatedItem: VocabularyItem) => goToNext(updatedItem)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </>
    );
  }

  return null; // Should not be reached
}

function PracticePageContent() {
    const searchParams = useSearchParams();
    const { data: vocabularyList, loading: vocabLoading } = useVocabulary();

    const initialPracticeList = useMemo(() => {
        if (vocabLoading) return null; // Return null while loading
        return generatePracticeList({ vocabularyList, searchParams });
    }, [vocabularyList, searchParams, vocabLoading]);

    if (vocabLoading || initialPracticeList === null) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold font-headline mb-2">
                    Preparing your session...
                </h2>
                <p className="text-muted-foreground">Loading vocabulary...</p>
            </div>
        );
    }
    
    return <PracticeSession initialPracticeList={initialPracticeList} />;
}


export default function PracticePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">Loading Session...</h2>
        </div>
      }>
        <PracticePageContent />
      </Suspense>
    </div>
  );
}
