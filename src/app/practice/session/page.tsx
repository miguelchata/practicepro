'use client';

import { Suspense } from 'react';
import { PracticePageContent } from '@/components/english/practice/practice-page-content';

export default function PracticeSessionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold font-headline mb-2">
              Loading Session...
            </h2>
          </div>
        }
      >
        <PracticePageContent />
      </Suspense>
    </div>
  );
}
