
'use client';

import {
  Suspense,
  useState,
  useMemo,
  useEffect,
  useTransition,
  useRef,
  useCallback,
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
import type { VocabularyItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { updateWordStats } from "@/lib/english";
import { PracticeItem } from "@/lib/types";

import { generatePracticeList } from "@/utils/generatePracticeList";
import { usePractice } from "@/hooks/use-practice";
import { set } from "date-fns";

// type ExerciseType = "guess" | "write" | "both";

// export type PracticeItem = {
//   wordData: VocabularyItem;
//   type: ExerciseType;
//   sessionAttempts?: number;
//   sessionConsecutiveFails?: number;
//   recentQualities?: number[];
//   lastShownAt?: number;
// };

function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: vocabularyList, loading } = useVocabulary();
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [isPending, startTransition] = useTransition();

  const initialPracticeList: PracticeItem[] = useMemo(
    () =>
      generatePracticeList({
        vocabularyList,
        searchParams,
        loading,
      }),
    [vocabularyList, searchParams, loading]
  );
  const { activeQueue, markCompleted, rotateToEnd, updateData } =
    usePractice(initialPracticeList);
  const [activeId, setActiveId] = useState<string | null>(
    activeQueue[0]?.wordData?.id || null
  );
  const active =
    activeQueue.find((item) => item.wordData.id === activeId) ||
    activeQueue[0] ||
    null;

  // session state
  const [practiceList, setPracticeList] = useState<PracticeItem[]>([]);
  const [practiceIndexes, setPracticeIndexes] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [correctlyAnswered, setCorrectlyAnswered] = useState(0);

  // refs to always read latest values (avoid stale closures)
  const practiceListRef = useRef(practiceList);
  useEffect(() => {
    practiceListRef.current = practiceList;
  }, [practiceList]);

  const practiceIndexesRef = useRef(practiceIndexes);
  useEffect(() => {
    practiceIndexesRef.current = practiceIndexes;
  }, [practiceIndexes]);

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const correctlyAnsweredRef = useRef(correctlyAnswered);
  useEffect(() => {
    correctlyAnsweredRef.current = correctlyAnswered;
  }, [correctlyAnswered]);

  // initial total (capture when initial list is built). keeps session target stable.
  const initialTotalRef = useRef(initialPracticeList.length);
  useEffect(() => {
    initialTotalRef.current = initialPracticeList.length;
  }, [initialPracticeList]);

  // small processing guard to prevent concurrent advance calls
  const advancingRef = useRef(false);

  // initialize session when initialPracticeList becomes available
  useEffect(() => {
    if (initialPracticeList.length > 0) {
      setPracticeList(initialPracticeList);
      setPracticeIndexes(
        Array.from({ length: initialPracticeList.length }, (_, i) => i)
      );
      setCurrentIndex(0);
      setCorrectlyAnswered(0);
      setSessionFinished(false);
      // update refs immediately
      practiceListRef.current = initialPracticeList;
      practiceIndexesRef.current = Array.from(
        { length: initialPracticeList.length },
        (_, i) => i
      );
      currentIndexRef.current = 0;
      correctlyAnsweredRef.current = 0;
      initialTotalRef.current = initialPracticeList.length;
    }
  }, []);

  // useEffect(() => {
  //   if (activeQueue.length === 0) {
  //     setSessionFinished(true);
  //   }
  // }, [activeQueue]);

  const handleFeedback = async (quality: number) => {
    // read stable indices from refs
    // const indexes = practiceIndexesRef.current;
    // const idx = currentIndexRef.current;

    // if (
    //   !Array.isArray(indexes) ||
    //   indexes.length === 0 ||
    //   idx < 0 ||
    //   idx >= indexes.length
    // ) {
    //   return null;
    // }

    // const practiceListLocal = practiceListRef.current;
    // const listIndex = indexes[idx]; // index inside practiceList
    // const currentItem = practiceListLocal[listIndex];

    // call updateWordStats (likely updates accuracy / nextReviewAt)
    const updatedItem = await updateWordStats(
      active.wordData,
      quality,
      active,
      updateVocabularyItem
    );

    // update practiceList in a functional way and update the ref
    // setPracticeList((prev) => {
    //   const next = prev.slice();
    //   // defensive: if listIndex is out of bounds, no-op
    //   if (listIndex >= 0 && listIndex < next.length) {
    //     next[listIndex] = { ...next[listIndex], wordData: updatedItem };
    //   }
    //   practiceListRef.current = next;
    //   return next;
    // });
    updateData(active.wordData.id, { wordData: updatedItem });

    return updatedItem.accuracy;
  };
  console.log("active list", activeQueue);

  const nextCard = (item: PracticeItem) => {
    const accuracy = item.wordData.accuracy ?? 0;
    const isNowCorrect = accuracy >= 0.7;
    console.log("accuracy", accuracy, isNowCorrect);

    if (isNowCorrect) {
      markCompleted(item.wordData.id);
    } else {
      rotateToEnd(item.wordData.id);
    }
    // Pick next item (animate even if only one remains)
    const next = activeQueue.find(
      (t) => !t.completed && t.wordData.id !== active.wordData.id
    );
    setActiveId(next ? next.wordData.id : Date.now().toString()); // triggers AnimatePresence change

    if (active === null) {
      setSessionFinished(true);
    }
  };

  const advanceToNextCard = useCallback(() => {
    // prevent re-entrancy
    if (advancingRef.current) return;
    advancingRef.current = true;
    // read the latest values via refs (avoid stale closure issues)
    try {
      const indexes = practiceIndexesRef.current;
      const idx = currentIndexRef.current;
      const correctCount = correctlyAnsweredRef.current;
      const initialTotal = initialTotalRef.current;
      const list = practiceListRef.current;

      // defensive checks
      if (
        !Array.isArray(indexes) ||
        indexes.length === 0 ||
        idx < 0 ||
        idx >= indexes.length
      ) {
        setSessionFinished(true);
        return;
      }

      const listIndex = indexes[idx];
      const item = list[listIndex];
      if (!item) {
        setSessionFinished(true);
        return;
      }

      const accuracy = item.wordData.accuracy ?? 0;
      const isNowCorrect = accuracy >= 0.7;

      // compute newIndexes deterministically
      const newIndexes = isNowCorrect
        ? indexes.filter((_, i) => i !== idx)
        : indexes.slice();
      const futureCorrectCount = correctCount + (isNowCorrect ? 1 : 0);

      // If finished
      if (futureCorrectCount >= initialTotal || newIndexes.length === 0) {
        // commit the update and finish
        startTransition(() => {
          setPracticeIndexes(() => newIndexes);
          if (isNowCorrect) setCorrectlyAnswered((prev) => prev + 1);
          setSessionFinished(true);
        });
        return;
      }

      // compute nextIndex relative to newIndexes
      let nextIndex = 0;
      if (newIndexes.length === 0) {
        nextIndex = 0;
      } else if (isNowCorrect) {
        nextIndex = idx >= newIndexes.length ? 0 : idx;
      } else {
        nextIndex = (idx + 1) % newIndexes.length;
      }

      // commit state updates atomically (use functional sets)
      startTransition(() => {
        setPracticeIndexes(() => newIndexes);
        setCurrentIndex(() => nextIndex);
        if (isNowCorrect) setCorrectlyAnswered((prev) => prev + 1);
      });
    } finally {
      // allow next call on next tick — this avoids accidental re-entrant calls during the same task
      // use setTimeout 0 to let React process state updates before allowing another advance
      window.setTimeout(() => {
        advancingRef.current = false;
      }, 0);
    }
  }, [startTransition]);

  if (sessionFinished || activeQueue.length === 0) {
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

  const currentItem: PracticeItem | undefined =
    practiceList[practiceIndexes[currentIndex]];

  if (!active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p>Loading next card...</p>
      </div>
    );
  }

  const progressPercentage =
    initialTotalRef.current > 0
      ? (correctlyAnswered / initialTotalRef.current) * 100
      : 0;

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
          {correctlyAnswered} / {initialTotalRef.current}
        </div>
      </header>
      <main
        className={`flex flex-1 flex-col items-center justify-center p-4 md:p-8 overflow-hidden transition-opacity duration-300 ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        <AnimatePresence mode="wait">
          {active && active.type === "guess" && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="bg-gradient-to-br from-indigo-900/70 to-rose-950/60 rounded-3xl p-6 shadow-2xl border border-white/6 w-full max-w-xl relative"
            >
              <Flashcard
                key={active.wordData.id}
                practiceItem={active}
                handleFeedback={handleFeedback}
                nextCard={nextCard}
              />
            </motion.div>
          )}
          {active && active.type === "write" && (
            <WritingCard
              key={active.wordData.id}
              practiceItem={active}
              handleFeedback={handleFeedback}
              nextCard={advanceToNextCard}
            />
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
