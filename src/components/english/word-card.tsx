
'use client';

import { CardTitle } from "@/components/ui/card";
import type { VocabularyItem } from "@/lib/types";

type WordCardProps = {
    wordData: Pick<VocabularyItem, 'word' | 'ipa'>;
    show: boolean;
};

export function WordCard({ wordData, show }: WordCardProps) {

    if (!show) {
        return <div className="min-h-[4rem]"></div>;
    }

    return (
        <div className="min-h-[4rem] flex flex-col justify-center">
            <div className="text-center pt-4 space-y-1">
                <CardTitle className="font-headline text-4xl">
                    {wordData.word}
                </CardTitle>
                {wordData.ipa && (
                    <p className="text-muted-foreground font-mono text-lg">
                    {wordData.ipa}
                    </p>
                )}
            </div>
        </div>
    );
}
