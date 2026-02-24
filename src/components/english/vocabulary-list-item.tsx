'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import type { VocabularyItem } from '@/lib/types';

type VocabularyListItemProps = {
  item: VocabularyItem;
  showSeparator: boolean;
};

export function VocabularyListItem({ item, showSeparator }: VocabularyListItemProps) {
  // Slugify the word for the URL: lowercase, trim, and replace spaces with hyphens
  const wordSlug = item.word.toLowerCase().trim().replace(/\s+/g, '-');

  return (
    <Link 
      href={`/management/${wordSlug}`} 
      className="block rounded-lg p-4 -m-4 transition-colors hover:bg-muted/50"
    >
      <div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <p className="truncate font-semibold">{item.word.charAt(0).toUpperCase() + item.word.slice(1)}</p>
            <div className="flex w-28 items-center gap-2">
              <Progress value={item.accuracy * 100} className="h-2" />
              <span className="w-9 text-right text-xs font-mono text-muted-foreground">
                {`${Math.round(item.accuracy * 100)}%`}
              </span>
            </div>
          </div>
          <p className="truncate text-sm text-muted-foreground">{item.definition}</p>
        </div>
        {showSeparator && <Separator className="mt-4" />}
      </div>
    </Link>
  );
}
