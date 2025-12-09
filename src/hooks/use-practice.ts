
'use client';

import { useEffect, useMemo, useReducer } from "react";
import type { PracticeItem, VocabularyItem } from "@/lib/types";
import { updateWordStats } from "@/lib/english";


// 1. Define State and Actions
export interface PracticeState {
  practiceItems: PracticeItem[];
  activeId: string | null;
  sessionFinished: boolean;
  completedCount: number;
  totalCount: number;
}

export type PracticeAction =
  | { type: 'INITIALIZE_SESSION'; payload: PracticeItem[] }
  | { type: 'UPDATE_SESSION'; payload: { updatedItem: VocabularyItem } }
  | { type: 'GO_TO_NEXT' };

// 2. Initial State
export const initialState: PracticeState = {
  practiceItems: [],
  activeId: null,
  sessionFinished: true,
  completedCount: 0,
  totalCount: 0,
};

// 3. Reducer Function
export function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'INITIALIZE_SESSION': {
      const initialList = action.payload;
      if (!initialList || initialList.length === 0) {
        return { ...initialState, sessionFinished: true };
      }
      return {
        practiceItems: initialList.map(item => ({...item, completed: false})),
        activeId: new Date().getTime().toString(),
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

      // Update in place
      nextItems[activeItemIndex] = { ...activeItem, wordData: updatedItem };

      if (updatedItem.accuracy > 0.7) {
        nextItems[activeItemIndex].completed = true;
        newCompletedCount += 1;
      }
      
      return {
        ...state,
        practiceItems: nextItems,
        completedCount: newCompletedCount,
      };
    }
    
    case 'GO_TO_NEXT': {
        const activeItemIndex = state.practiceItems.findIndex((p) => !p.completed);
        
        if (activeItemIndex === -1) {
            return { ...state, activeId: null, sessionFinished: true };
        }

        const activeItem = state.practiceItems[activeItemIndex];
        let nextItems = [...state.practiceItems];

        if (!activeItem.completed) {
            const itemToRequeue = { ...activeItem };
            nextItems.splice(activeItemIndex, 1);
            nextItems.push(itemToRequeue);
        }

        const remainingQueue = nextItems.filter((p) => !p.completed);
        
        if (remainingQueue.length === 0) {
            return { ...state, practiceItems: nextItems, activeId: null, sessionFinished: true };
        }

        return {
            ...state,
            practiceItems: nextItems,
            activeId: new Date().getTime().toString(),
            sessionFinished: false,
        };
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
    return state.practiceItems.find(p => !p.completed) || null;
  }, [state.practiceItems, state.sessionFinished]);
  
  const practicedItems = useMemo(() => {
    return state.practiceItems.filter(p => p.completed);
  }, [state.practiceItems]);

  const handleFeedback = async (quality: number): Promise<VocabularyItem | null> => {
    if (!active) return null;

    const updatedWordData = updateWordStats(active.wordData, quality);
    dispatch({ type: 'UPDATE_SESSION', payload: { updatedItem: updatedWordData } });
    return updatedWordData;
  };

  const goToNext = () => {
    dispatch({ type: 'GO_TO_NEXT' });
  };

  return {
    state,
    dispatch,
    active,
    practicedItems,
    handleFeedback,
    goToNext,
  };
}
