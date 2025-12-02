
import { useEffect, useMemo, useReducer } from "react";
import type { PracticeItem, VocabularyItem } from "@/lib/types";

// 1. Define State and Actions
interface PracticeState {
  practiceItems: PracticeItem[];
  activeId: string | null;
  sessionFinished: boolean;
}

type PracticeAction =
  | { type: 'INITIALIZE_SESSION'; payload: PracticeItem[] }
  | { type: 'ADVANCE_SESSION'; payload: { updatedItem: VocabularyItem } };

// 2. Initial State
const initialState: PracticeState = {
  practiceItems: [],
  activeId: null,
  sessionFinished: true,
};

// 3. Reducer Function
function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'INITIALIZE_SESSION': {
      const initialList = action.payload;
      if (!initialList || initialList.length === 0) {
        return { ...initialState, sessionFinished: true };
      }
      return {
        practiceItems: initialList,
        activeId: new Date().getTime().toString(), // Unique ID for the first card animation
        sessionFinished: false,
      };
    }

    case 'ADVANCE_SESSION': {
      const { updatedItem } = action.payload;
      
      const activeItem = state.practiceItems.find(p => !p.completed);

      if (!activeItem) {
          return { ...state, sessionFinished: true };
      }

      // Ensure we are updating the correct item's data
      const currentWordId = activeItem.wordData.id;
      if (currentWordId !== updatedItem.id) {
          console.warn("Mismatched item update in practice reducer. This might indicate a bug.");
          // To be safe, don't change state if IDs don't match
          return state;
      }

      const isCorrect = updatedItem.accuracy >= 0.7;

      let nextItems: PracticeItem[];

      if (isCorrect) {
        // Mark as completed
        nextItems = state.practiceItems.map((p) =>
          p.wordData.id === currentWordId
            ? { ...p, wordData: updatedItem, completed: true }
            : p
        );
      } else {
        // Incorrect: Re-insert the item a few spots down the line.
        const queue = state.practiceItems.filter(p => !p.completed);
        const currentIndex = queue.findIndex(p => p.wordData.id === currentWordId);
        
        if (currentIndex === -1) return state; // Should not happen

        const itemToReinsert = { ...queue[currentIndex], wordData: updatedItem };
        const remainingQueue = queue.filter(p => p.wordData.id !== currentWordId);
        
        // Insert it 2 positions away, or at the end if the queue is short.
        const reinsertIndex = Math.min(currentIndex + 2, remainingQueue.length);
        
        const newQueue = [
            ...remainingQueue.slice(0, reinsertIndex),
            itemToReinsert,
            ...remainingQueue.slice(reinsertIndex)
        ];

        const completedItems = state.practiceItems.filter(p => p.completed);
        nextItems = [...newQueue, ...completedItems];
      }

      const nextQueue = nextItems.filter((p) => !p.completed);

      if (nextQueue.length === 0) {
        return { ...state, practiceItems: nextItems, activeId: null, sessionFinished: true };
      } else {
        return {
          ...state,
          practiceItems: nextItems,
          activeId: new Date().getTime().toString(), // New unique ID for next card animation
          sessionFinished: false,
        };
      }
    }

    default:
      return state;
  }
}

// 4. The Hook
export function usePractice(initialPracticeList: PracticeItem[] | null) {
  const [state, dispatch] = useReducer(practiceReducer, initialState);

  useEffect(() => {
    if (initialPracticeList) {
      dispatch({ type: 'INITIALIZE_SESSION', payload: initialPracticeList });
    }
  }, [initialPracticeList]);

  const active = useMemo(() => {
    if (state.sessionFinished || !state.practiceItems) return null;
    // The active item is always the first one in the queue that is not completed
    return state.practiceItems.find(p => !p.completed) || null;
  }, [state.practiceItems, state.sessionFinished]);
  
  const completedCount = useMemo(() => {
    return state.practiceItems.filter((p) => p.completed).length;
  }, [state.practiceItems]);
  
  const totalCount = useMemo(() => {
    return state.practiceItems.length;
  }, [state.practiceItems]);

  const goToNext = (updatedItem: VocabularyItem) => {
    dispatch({ type: 'ADVANCE_SESSION', payload: { updatedItem } });
  };

  return {
    active,
    activeId: state.activeId,
    completedCount,
    totalCount,
    sessionFinished: state.sessionFinished,
    goToNext,
  };
}
