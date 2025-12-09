
'use client';

import { createContext, type ReactNode, useMemo } from 'react';
import { usePractice, type PracticeState, type PracticeAction } from '@/hooks/use-practice';
import type { PracticeItem, VocabularyItem } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { generatePracticeList } from '@/utils/generatePracticeList';


type PracticeContextType = {
    state: PracticeState;
    dispatch: React.Dispatch<PracticeAction>;
    active: PracticeItem | null;
    handleFeedback: (quality: number) => Promise<VocabularyItem | null>;
    goToNext: () => void;
};

export const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

type PracticeProviderProps = {
    children: ReactNode;
};

export function PracticeProvider({ children }: PracticeProviderProps) {
    const searchParams = useSearchParams();
    const { data: vocabularyList, loading: vocabLoading } = useVocabulary();

    const initialPracticeList = useMemo(() => {
        if (vocabLoading) return null; // Return null while loading
        return generatePracticeList({ vocabularyList, searchParams });
    }, [vocabularyList, searchParams, vocabLoading]);

    const practiceValues = usePractice(initialPracticeList);

    if (vocabLoading || initialPracticeList === null) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">
              Preparing your session...
            </h2>
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </div>
        );
    }

    return (
        <PracticeContext.Provider value={practiceValues}>
            {children}
        </PracticeContext.Provider>
    );
}
