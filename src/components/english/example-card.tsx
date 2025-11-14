
'use client';

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { BlurredWord } from "@/components/english/blurred-word";
import type { VocabularyItem } from "@/lib/types";

type ExampleCardProps = {
    wordData: VocabularyItem;
    show: boolean;
    onToggle: () => void;
    showFullWord: boolean;
};

export function ExampleCard({ wordData, show, onToggle, showFullWord }: ExampleCardProps) {
    if (!wordData.examples || wordData.examples.length === 0) {
        return <div className="min-h-[6rem]"></div>;
    }

    if (!show) {
        return (
            <div className="min-h-[6rem] flex flex-col justify-center text-center">
                <Button variant="outline" onClick={onToggle}>
                    Show Examples
                </Button>
            </div>
        );
    }
    
    return (
        <div className="min-h-[6rem] flex flex-col justify-center">
            <Separator />
            <div className="relative pt-6">
                <Carousel
                    opts={{
                    align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                    {wordData.examples.map((example, index) => (
                        <CarouselItem key={index}>
                        <div className="p-1">
                            <p className="text-center text-lg italic text-muted-foreground">
                            &quot;
                            <BlurredWord
                                sentence={example}
                                wordToBlur={wordData.word}
                                showFullWord={showFullWord}
                            />
                            &quot;
                            </p>
                        </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Carousel>
            </div>
        </div>
    );
}
