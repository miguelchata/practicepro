
import { useState, useEffect, useMemo } from "react";
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

  const goToNext = () => {
    if (!active) {
      setSessionFinished(true);
      return;
    }

    const accuracy = active.wordData.accuracy ?? 0;
    const isNowCorrect = accuracy >= 0.7;

    if (isNowCorrect) {
      markCompleted(active.wordData.id);
    } else {
      rotateToEnd(active.wordData.id);
    }
    
    // This needs to be calculated based on the state *after* the current one is marked/rotated
    const nextQueue = practiceItems.filter(p => !p.completed && p.wordData.id !== (isNowCorrect ? active.wordData.id : ''));
    const nextItem = nextQueue.find(p => p.wordData.id !== active.wordData.id) || (isNowCorrect ? nextQueue[0] : null);

    if (nextQueue.length === 0 || (isNowCorrect && nextQueue.length === 1 && nextQueue[0].wordData.id === active.wordData.id)) {
        setSessionFinished(true);
    } else if (nextItem) {
        setActiveId(nextItem.wordData.id);
    } else {
        // Fallback case: if something goes wrong, or last item is rotated
        const finalQueue = practiceItems.filter(p => !p.completed);
        if (finalQueue.length > 0) {
            setActiveId(finalQueue[0].wordData.id)
        } else {
            setSessionFinished(true);
        }
    }
  };


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
