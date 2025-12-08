
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
  | { type: 'UPDATE_SESSION'; payload: { updatedItem: VocabularyItem } }
  | { type: 'SESSION_FINISHED' };

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
    
    case 'UPDATE_SESSION': {
      const { updatedItem } = action.payload;
      
      const activeItemIndex = state.practiceItems.findIndex(p => !p.completed);
      if (activeItemIndex === -1) {
          return state; // No active item to update
      }

      const activeItem = state.practiceItems[activeItemIndex];
       if (activeItem.wordData.id !== updatedItem.id) {
          console.warn("Mismatched item update in practice reducer. This might indicate a bug.");
          return state;
      }
      
      const nextItems = [...state.practiceItems];
      let newCompletedCount = state.completedCount;

      if (updatedItem.accuracy > 0.7) {
        // Mark as completed for this session
        nextItems[activeItemIndex] = { ...activeItem, wordData: updatedItem, completed: true };
        newCompletedCount += 1;
      } else {
        // Not mastered yet, just update the data in place.
        nextItems[activeItemIndex] = { ...activeItem, wordData: updatedItem, completed: false };
      }
      
      return {
        ...state,
        practiceItems: nextItems,
        completedCount: newCompletedCount,
      };
    }
    
    case 'SESSION_FINISHED': {
        const remainingQueue = state.practiceItems.filter((p) => !p.completed);

        if (remainingQueue.length === 0) {
            return { ...state, activeId: null, sessionFinished: true };
        } else {
            return {
            ...state,
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
  
  const practicedItems = useMemo(() => {
    // Return all items that were interacted with and are now marked as completed
    return state.practiceItems.filter(p => p.completed);
  }, [state.practiceItems]);

  const updateState = (updatedItem: VocabularyItem) => {
    dispatch({ type: 'UPDATE_SESSION', payload: { updatedItem } });
  };

  const goToNext = () => {
    dispatch({ type: 'SESSION_FINISHED' });
  };

  return {
    active,
    activeId: state.activeId,
    completedCount: state.completedCount,
    totalCount: state.totalCount,
    sessionFinished: state.sessionFinished,
    practicedItems,
    updateState,
    goToNext,
  };
}
