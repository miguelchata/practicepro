
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { generatePracticeList } from '@/utils/generatePracticeList';
import { PracticeSession } from './practice-session';
import { PracticeProvider } from '@/context/practice-context';

export function PracticePageContent() {
  const searchParams = useSearchParams();
  const { data: vocabularyList, loading: vocabLoading } = useVocabulary();

  const initialPracticeList = useMemo(() => {
    if (vocabLoading) return null;
    return generatePracticeList({ vocabularyList, searchParams });
  }, [vocabularyList, searchParams, vocabLoading]);

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
    <PracticeProvider initialPracticeList={initialPracticeList}>
        <PracticeSession />
    </PracticeProvider>
  );
}
