
'use client';

import type { VocabularyItem } from '@/lib/types';
import { VocabularyListItem } from './vocabulary-list-item';
import { Skeleton } from '@/components/ui/skeleton';

type VocabularyListProps = {
  items: VocabularyItem[];
  loading?: boolean;
  loadingItemsCount?: number;
};

export function VocabularyList({ items, loading = false, loadingItemsCount = 3 }: VocabularyListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(loadingItemsCount)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }
  
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <VocabularyListItem
          key={item.id}
          item={item}
          showSeparator={index < items.length - 1}
        />
      ))}
    </div>
  );
}
