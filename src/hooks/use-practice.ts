
import { useEffect, useMemo, useReducer } from "react";
import type { PracticeItem, VocabularyItem } from "@/lib/types";

// 1. Define State and Actions
interface PracticeState {
  practiceItems: PracticeItem[];
  activeId: string | null;
  sessionFinished: boolean;
  completedCount: number;
  totalCount: number;
}

type PracticeAction =
  | { type: 'INITIALIZE_SESSION'; payload: PracticeItem[] }
  | { type: 'ADVANCE_SESSION'; payload: { updatedItem: VocabularyItem } };

// 2. Initial State
const initialState: PracticeState = {
  practiceItems: [],
  activeId: null,
  sessionFinished: true,
  completedCount: 0,
  totalCount: 0,
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
        practiceItems: initialList.map(item => ({...item, completed: false})), // Ensure completed is false
        activeId: new Date().getTime().toString(), // Unique ID for the first card animation
        sessionFinished: false,
        completedCount: 0,
        totalCount: initialList.length,
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

      let nextItems: PracticeItem[];

      // Mark as completed
      nextItems = state.practiceItems.map((p) =>
        p.wordData.id === currentWordId
          ? { ...p, wordData: updatedItem, completed: true }
          : p
      );

      const nextQueue = nextItems.filter((p) => !p.completed);
      const newCompletedCount = state.completedCount + 1;

      if (nextQueue.length === 0) {
        return { ...state, practiceItems: nextItems, activeId: null, sessionFinished: true, completedCount: newCompletedCount };
      } else {
        return {
          ...state,
          practiceItems: nextItems,
          activeId: new Date().getTime().toString(), // New unique ID for next card animation
          sessionFinished: false,
          completedCount: newCompletedCount,
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
  
  const practicedItems = useMemo(() => {
    return state.practiceItems.filter(p => p.completed);
  }, [state.practiceItems]);

  const goToNext = (updatedItem: VocabularyItem) => {
    dispatch({ type: 'ADVANCE_SESSION', payload: { updatedItem } });
  };

  return {
    active,
    activeId: state.activeId,
    completedCount: state.completedCount,
    totalCount: state.totalCount,
    sessionFinished: state.sessionFinished,
    practicedItems,
    goToNext,
  };
}
