import { useEffect, useState } from "react";

import { PracticeItem } from "@/lib/types";

export function usePractice(initialPractice: PracticeItem[]) {
  const [practice, setPractice] = useState(initialPractice);
  const activeQueue = practice.filter((p) => !p.completed);
  const completed = practice.filter((p) => p.completed);

  const markCompleted = (id: string) => {
    console.log("markCompleted", id);
    setPractice((prev) =>
      prev.map((p) => (p.wordData.id === id ? { ...p, completed: true } : p))
    );
  };

  const rotateToEnd = (id: string) => {
    setPractice((prev) => {
      const item = prev.find((p) => p.wordData.id === id);

      if (!item) return prev;

      const rest = prev.filter((p) => p.wordData.id !== id);
      return [...rest, item];
    });
  };

  const updateData = (id: string, data: Partial<PracticeItem>) => {
    setPractice((prev) =>
      prev.map((p) => (p.wordData.id === id ? { ...p, ...data } : p))
    );
  };

  useEffect(() => {
    if (initialPractice.length > 0) {
      setPractice(initialPractice);
    }
  }, [initialPractice]);

  return {
    activeQueue,
    completed,
    updateData,
    markCompleted,
    rotateToEnd,
  };
}
