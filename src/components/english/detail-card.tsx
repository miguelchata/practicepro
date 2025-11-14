
'use client';

import type { VocabularyItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type DetailCardProps = {
  wordData: VocabularyItem;
  promptText?: string;
};

export function DetailCard({ wordData, promptText = "Can you remember the vocab?" }: DetailCardProps) {
  return (
    <>
        <div className="min-h-[2rem]">
          <p className="text-sm font-medium text-muted-foreground">
            {promptText}
          </p>
        </div>
        <div className="min-h-[3rem] mt-6 space-y-2">
          {wordData.type && <Badge variant="outline">{wordData.type}</Badge>}
          <p className="text-muted-foreground text-lg">{wordData.definition}</p>
        </div>
    </>
  );
}
