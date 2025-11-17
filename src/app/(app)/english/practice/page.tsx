
'use client';

import {
  Suspense,
  useState,
  useMemo,
  useEffect,
  useTransition,
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
import type { PracticeItem } from "@/lib/types";
import { usePractice } from "@/hooks/use-practice";
import { generatePracticeList } from "@/utils/generatePracticeList";
import { motion, AnimatePresence } from "framer-motion";

function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: vocabularyList, loading } = useVocabulary();
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [isPending, startTransition] = useTransition();

  const initialPracticeList = useMemo(() => {
    if (loading || vocabularyList.length === 0) return [];
    return generatePracticeList({ vocabularyList, searchParams });
  }, [vocabularyList, searchParams, loading]);

  const {
    active,
    activeId,
    completedCount,
    totalCount,
    markCompleted,
    rotateToEnd,
    updateData,
    goToNext,
    sessionFinished,
    setSessionFinished,
  } = usePractice(initialPracticeList);

  const handleFeedback = async (quality: number) => {
    if (!active) return null;

    const updatedWordData = updateWordStats(
      active.wordData,
      quality,
      active,
      updateVocabularyItem
    );

    updateData(active.wordData.id, { wordData: updatedWordData });
    return updatedWordData.accuracy;
  };

  const nextCard = (item: PracticeItem) => {
    startTransition(() => {
        goToNext();
    });
  };

  useEffect(() => {
    if (!loading && initialPracticeList.length === 0 && vocabularyList.length > 0) {
      setSessionFinished(true);
    }
  }, [loading, initialPracticeList, vocabularyList, setSessionFinished]);


  if (loading && initialPracticeList.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">
            Preparing your session...
            </h2>
            <p className="text-muted-foreground">Loading vocabulary...</p>
        </div>
    );
  }

  if (sessionFinished) {
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

  if (!active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p>Loading next card...</p>
      </div>
    );
  }

  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        className={`flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-hidden transition-opacity duration-300 ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
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
                nextCard={nextCard}
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
                    nextCard={nextCard}
                />
            </motion.div>
          )}
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
