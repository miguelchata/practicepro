
import { useState, useEffect, useMemo, useCallback } from "react";
import { useImmer } from "use-immer"
import type { PracticeItem, VocabularyItem } from "@/lib/types";

export function usePractice(initialPracticeList: PracticeItem[]) {
  // const [practiceItems, setPracticeItems] = useState<PracticeItem[]>(initialPracticeList);
  const [practiceItems, setPracticeItems] = useImmer<PracticeItem[]>(initialPracticeList);
  // const [activeId, setActiveId]
  const [activeId, setActiveId] = useState<string | null>(new Date().getTime().toString());
  // const [sessionFinished, setSessionFinished] = useState(false);

  // useEffect(() => {
  //   if (initialPracticeList.length > 0) {
  //     setPracticeItems(initialPracticeList);
  //     // setActiveId(initialPracticeList[0]?.wordData.id || null);
  //     setSessionFinished(false);
  //   } else if (initialPracticeList.length === 0) {
  //     setSessionFinished(true);
  //   }
  // }, [initialPracticeList]);

  const activeQueue = useMemo(
    () => practiceItems.filter((p) => !p.completed),
    [practiceItems]
  );
  const completedCount = useMemo(
    () => practiceItems.filter((p) => p.completed).length,
    [practiceItems]
  );
  const totalCount = useMemo(() => practiceItems.length, [practiceItems]);
  const sessionFinished = useMemo(
    () => activeQueue.length === 0,
    [activeQueue]
  );


  const active = useMemo(() => {
    return (
      activeQueue.find((item) => item.wordData.id === activeId) ||
      activeQueue[0] ||
      null
    );
  }, [activeId, activeQueue]);

  const updateData = (id: string, data: Partial<PracticeItem>) => {
    setPracticeItems((prev) =>
      prev.map((p) => (p.wordData.id === id ? { ...p, ...data } : p))
    );
  };

  const markCompleted = (id: string) => {
    setPracticeItems((prev) =>
      prev.map((p) => (p.wordData.id === id ? { ...p, completed: true } : p))
    );
  };

  const rotateToEnd = (id: string) => {
    setPracticeItems((prev) => {
      const item = prev.find((p) => p.wordData.id === id);
      if (!item) return prev;
      const rest = prev.filter((p) => p.wordData.id !== id);
      return [...rest, item];
    });
  };

  const goToNext = (updatedItem: VocabularyItem) => {
    setPracticeItems((currentItems) => {
      const currentActive = currentItems.find(
        (item) => item.wordData.id === active.wordData.id
      );

      // if (currentActive) {
      //   currentActive.wordData = {...currentActive.wordData, ...updatedItem}
      //   const isCorrect = currentActive.wordData.accuracy >= 0.7;

      //   if (isCorrect) {
      //     currentActive.completed = true  
      //   } else {
      //     const index = currentItems.findIndex(
      //       (item) => item.wordData.id === currentActive.wordData.id
      //     );
      //     if (index !== -1) {
      //       const [itemToRotate] = currentItems.splice(index, 1);
      //       currentItems.push(itemToRotate)
      //     }
      //   }

      //   const nextQueue = currentItems.filter((p) => !p.completed);
      //   if (nextQueue.length === 0) {
      //     setActiveId(null); // No more active items
      //   } else {
      //     setActiveId(new Date().getTime().toString()); // Set new active item
      //   }
      // }

      if (!currentActive) {
        // setSessionFinished(true);
        return currentItems;
      }
      const updatedActive = { ...currentActive, ...updatedItem };
      const isNowCorrect = updatedActive.wordData.accuracy >= 0.7;

      let nextItems;
      if (isNowCorrect) {
        // Mark as completed
        nextItems = currentItems.map((p) =>
          p.wordData.id === updatedActive.wordData.id
            ? { ...p, ...updatedActive, completed: true }
            : p
        );
      } else {
        // Rotate to end
        const itemToRotate = currentItems.find(
          (p) => p.wordData.id === updatedActive.wordData.id
        );
        if (!itemToRotate) return currentItems; // Should not happen
        const rest = currentItems.filter(
          (p) => p.wordData.id !== updatedActive.wordData.id
        );
        nextItems = [...rest, { ...itemToRotate, ...updatedActive }];
      }

      const nextQueue = nextItems.filter((p) => !p.completed);

      if (nextQueue.length === 0) {
        // setSessionFinished(true);
        setActiveId(null);
      } else {
        // The next active item is always the first in the queue
        // setActiveId(nextQueue[0].wordData.id);
        setActiveId(new Date().getTime().toString());
      }

      return nextItems;
    });
  }

  return {
    active,
    activeId,
    completedCount,
    totalCount,
    updateData,
    markCompleted,
    rotateToEnd,
    goToNext,
    sessionFinished,
    // setSessionFinished,
  };
}
