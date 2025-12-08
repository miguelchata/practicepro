
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
  | { type: 'ADVANCE_SESSION'; payload: { updatedItem: VocabularyItem } }
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

    case 'ADVANCE_SESSION': {
        const { updatedItem } = action.payload;
        
        const activeItemIndex = state.practiceItems.findIndex(p => !p.completed);
        if (activeItemIndex === -1) {
            return { ...state, sessionFinished: true };
        }
  
        const activeItem = state.practiceItems[activeItemIndex];
         if (activeItem.wordData.id !== updatedItem.id) {
            console.warn("Mismatched item update in practice reducer. This might indicate a bug.");
            return state;
        }
        
        let nextItems = [...state.practiceItems];
        let newCompletedCount = state.completedCount;
  
        if (updatedItem.accuracy > 0.7) {
          // Mark as completed for this session
          nextItems[activeItemIndex] = { ...activeItem, wordData: updatedItem, completed: true };
          newCompletedCount += 1;
        } else {
          // Not mastered yet, move to the back of the queue
          const itemToRequeue = { ...activeItem, wordData: updatedItem, completed: false };
          nextItems.splice(activeItemIndex, 1); // Remove from current position
          nextItems.push(itemToRequeue); // Add to the end
        }

        return {
            ...state,
            practiceItems: nextItems,
            completedCount: newCompletedCount,
        };
    }

    case 'SESSION_FINISHED':
        return { ...state, sessionFinished: true };

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
    // Return all items that were interacted with, now marked as completed
    return state.practiceItems.filter(p => p.completed);
  }, [state.practiceItems]);

  const goToNext = (updatedItem: VocabularyItem) => {
    dispatch({ type: 'ADVANCE_SESSION', payload: { updatedItem } });

    // Check if the next active item is null AFTER dispatching
    const nextQueue = state.practiceItems.filter(p => !p.completed);
    const isLastItem = nextQueue.length === 1 && nextQueue[0].wordData.id === updatedItem.id;
    
    if (isLastItem && updatedItem.accuracy > 0.7) {
        dispatch({ type: 'SESSION_FINISHED' });
    } else {
        // This generates a new ID to trigger animation for the next card
        dispatch({ type: 'INITIALIZE_SESSION', payload: state.practiceItems });
    }
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
