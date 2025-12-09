
'use client';

import { PracticeSession } from './practice-session';
import { PracticeProvider } from '@/context/practice-context';

export function PracticePageContent() {
  return (
    <PracticeProvider>
      <PracticeSession />
    </PracticeProvider>
  );
}
