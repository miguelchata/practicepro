
'use client';

import { createContext, type ReactNode } from 'react';
import { usePractice, type PracticeState, type PracticeAction } from '@/hooks/use-practice';
import type { PracticeItem, VocabularyItem } from '@/lib/types';

type PracticeContextType = {
    state: PracticeState;
    dispatch: React.Dispatch<PracticeAction>;
    active: PracticeItem | null;
    practicedItems: PracticeItem[];
    handleFeedback: (quality: number) => Promise<VocabularyItem | null>;
    goToNext: () => void;
};

export const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

type PracticeProviderProps = {
    children: ReactNode;
    initialPracticeList: PracticeItem[];
};

export function PracticeProvider({ children, initialPracticeList }: PracticeProviderProps) {
    const practiceValues = usePractice(initialPracticeList);

    return (
        <PracticeContext.Provider value={practiceValues}>
            {children}
        </PracticeContext.Provider>
    );
}
