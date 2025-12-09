
'use client';

import { createContext, type ReactNode, useMemo, useEffect, useState } from 'react';
import { usePractice, type PracticeState, type PracticeAction } from '@/hooks/use-practice';
import type { PracticeItem, VocabularyItem } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { generatePracticeList } from '@/utils/generatePracticeList';
import { getVocabularyForUser } from '@/services/vocabulary';


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
    const firestore = useFirestore();
    const { data: user, loading: userLoading } = useUser();
    const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
    const [vocabLoading, setVocabLoading] = useState(true);

    useEffect(() => {
      if (firestore && user) {
        setVocabLoading(true);
        getVocabularyForUser(firestore, user.uid)
          .then(data => {
            setVocabularyList(data);
          })
          .catch(error => {
            console.error("Failed to load vocabulary:", error);
            setVocabularyList([]); // Ensure list is empty on error
          })
          .finally(() => {
            setVocabLoading(false);
          });
      } else if (!user && !userLoading) {
        // If there's no user and we're not loading the user, stop loading.
        setVocabLoading(false);
      }
    }, [firestore, user, userLoading]);

    const initialPracticeList = useMemo(() => {
        if (vocabLoading) return null; // Return null while loading
        return generatePracticeList({ vocabularyList, searchParams });
    }, [vocabularyList, searchParams, vocabLoading]);

    const practiceValues = usePractice(initialPracticeList);

    if (userLoading || vocabLoading || initialPracticeList === null) {
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
