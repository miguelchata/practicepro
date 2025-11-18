
import { useState, useEffect, useMemo, useCallback } from "react";
import type { PracticeItem } from "@/lib/types";

export function usePractice(initialPracticeList: PracticeItem[]) {
  const [practiceItems, setPracticeItems] = useState<PracticeItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);

  useEffect(() => {
    if (initialPracticeList.length > 0) {
      setPracticeItems(initialPracticeList);
      setActiveId(initialPracticeList[0]?.wordData.id || null);
      setSessionFinished(false);
    } else if (initialPracticeList.length === 0) {
      setSessionFinished(true);
    }
  }, [initialPracticeList]);

  const activeQueue = useMemo(() => practiceItems.filter(p => !p.completed), [practiceItems]);
  const completedCount = useMemo(() => practiceItems.filter(p => p.completed).length, [practiceItems]);
  const totalCount = useMemo(() => practiceItems.length, [practiceItems]);
  
  const active = useMemo(() => {
    return activeQueue.find(item => item.wordData.id === activeId) || activeQueue[0] || null;
  }, [activeId, activeQueue]);

  const updateData = (id: string, data: Partial<PracticeItem>) => {
    setPracticeItems(prev =>
      prev.map(p => (p.wordData.id === id ? { ...p, ...data } : p))
    );
  };
  
  const markCompleted = (id: string) => {
    setPracticeItems(prev =>
      prev.map(p => (p.wordData.id === id ? { ...p, completed: true } : p))
    );
  };

  const rotateToEnd = (id: string) => {
    setPracticeItems(prev => {
      const item = prev.find(p => p.wordData.id === id);
      if (!item) return prev;
      const rest = prev.filter(p => p.wordData.id !== id);
      return [...rest, item];
    });
  };

  const goToNext = useCallback(() => {
    setPracticeItems(currentItems => {
        const currentActive = currentItems.find(item => item.wordData.id === activeId);

        if (!currentActive) {
            setSessionFinished(true);
            return currentItems;
        }

        const accuracy = currentActive.wordData.accuracy ?? 0;
        const isNowCorrect = accuracy >= 0.7;

        let nextItems;
        if (isNowCorrect) {
            // Mark as completed
            nextItems = currentItems.map(p => (p.wordData.id === activeId ? { ...p, completed: true } : p));
        } else {
            // Rotate to end
            const itemToRotate = currentItems.find(p => p.wordData.id === activeId);
            if (!itemToRotate) return currentItems; // Should not happen
            const rest = currentItems.filter(p => p.wordData.id !== activeId);
            nextItems = [...rest, itemToRotate];
        }

        const nextQueue = nextItems.filter(p => !p.completed);

        if (nextQueue.length === 0) {
            setSessionFinished(true);
            setActiveId(null);
        } else {
            // The next active item is always the first in the queue
            setActiveId(nextQueue[0].wordData.id);
        }

        return nextItems;
    });
  }, [activeId]);


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
    setSessionFinished,
  };
}
