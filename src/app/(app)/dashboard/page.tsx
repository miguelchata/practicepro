'use client';

import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/firebase/firestore/use-doc';
import { useMemo, useState, useEffect } from 'react';
import { DueReviewCard } from '@/components/dashboard/due-review-card';
import { VocabularyBreakdown } from '@/components/dashboard/vocabulary-breakdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: vocabulary, loading: vocabLoading } = useVocabulary();
  const { data: user } = useUser();
  const { data: userProfile, loading: profileLoading } = useUserProfile(user?.uid);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!mounted) return null;
    
    const now = new Date();
    const total = vocabulary.length;
    const mastered = vocabulary.filter(item => item.accuracy >= 0.8).length;
    const due = vocabulary.filter(item => {
      if (!item.nextReviewAt) return true;
      return new Date(item.nextReviewAt) <= now;
    }).length;
    const learning = vocabulary.filter(item => item.repetitions > 0 && item.accuracy < 0.8).length;
    const newWords = vocabulary.filter(item => item.repetitions === 0).length;

    return {
      total,
      mastered,
      due,
      learning,
      newWords,
      streak: userProfile?.currentStreak || 0
    };
  }, [vocabulary, userProfile, mounted]);

  const isLoading = vocabLoading || profileLoading || !mounted;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-6xl mx-auto w-full">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : (
            <StatsCards stats={stats} />
          )}
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {isLoading || !stats ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <DueReviewCard dueCount={stats.due} totalCount={stats.total} />
            )}
          </div>
          <div>
            <VocabularyBreakdown 
              mastered={stats?.mastered || 0} 
              learning={stats?.learning || 0} 
              newWords={stats?.newWords || 0} 
              loading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
