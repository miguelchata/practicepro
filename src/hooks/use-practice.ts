
'use client';

import { useEffect, useMemo, useReducer, useRef } from "react";
import type { PracticeItem, VocabularyItem } from "@/lib/types";
import { updateWordStats } from "@/lib/english";


// 1. Define State and Actions
export interface PracticeState {
  practiceItems: PracticeItem[];
  practicedItems: PracticeItem[];
  activeId: string | null;
  active: PracticeItem | null;
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
  practicedItems: [],
  activeId: null,
  active: null,
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
        practicedItems: [],
        activeId: new Date().getTime().toString(),
        active: initialList[0],
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

      const itemsPracticed = nextItems.filter(p => p.completed);
      const listPracticed = [...state.practicedItems, ...itemsPracticed]
      
      
      return {
        ...state,
        practiceItems: nextItems,
        practicedItems: listPracticed,
        completedCount: newCompletedCount,
      };
    }
    
    case 'GO_TO_NEXT': {
      const activeItemIndex = state.practiceItems.findIndex((p) => !p.completed);
        
      // This case handles advancing the card. If the just-finished card was NOT completed, re-queue it.
      let nextItems = [...state.practiceItems];

      if (activeItemIndex !== -1) {
          const activeItem = state.practiceItems[activeItemIndex];
          if (!activeItem.completed) {
              const itemToRequeue = { ...activeItem };
              nextItems.splice(activeItemIndex, 1);
              nextItems.push(itemToRequeue);
          }
      }

      const remainingQueue = nextItems.filter((p) => !p.completed);
      
      if (remainingQueue.length === 0) {
          return { ...state, practiceItems: [], activeId: null, sessionFinished: true };
      }

      return {
          ...state,
          active: remainingQueue[0],
          practiceItems: remainingQueue,
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
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initialPracticeList && initialPracticeList.length > 0) {
      dispatch({ type: 'INITIALIZE_SESSION', payload: initialPracticeList });
    }
  }, [initialPracticeList]);

  const active = useMemo(() => {
    if (state.sessionFinished || !state.practiceItems) return null;
    return state.practiceItems.find(p => !p.completed) || null;
  }, [state.practiceItems, state.sessionFinished]);
  

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
    active: state.active,
    handleFeedback,
    goToNext,
  };
}
