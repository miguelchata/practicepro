'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { BlurredWord } from "@/components/english/blurred-word";
import type { VocabularyItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ExampleCardProps = {
    wordData: VocabularyItem;
    show: boolean;
    onToggle: () => void;
    showFullWord: boolean;
};

export function ExampleCard({ wordData, show, onToggle, showFullWord }: ExampleCardProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const scrollTo = useCallback((index: number) => {
        api?.scrollTo(index);
    }, [api]);


    if (!wordData.examples || wordData.examples.length === 0) {
        return <div className="min-h-[4rem]"></div>;
    }

    if (!show) {
        return (
            <div className="min-h-[4rem] flex flex-col justify-center text-center">
                <Button variant="outline" onClick={onToggle} size="sm">
                    Show Examples
                </Button>
            </div>
        );
    }
    
    return (
        <div className="min-h-[4rem] flex flex-col justify-center">
            <Separator />
            <div className="pt-4">
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                    {wordData.examples.map((example, index) => (
                        <CarouselItem key={index}>
                        <div className="p-1">
                            <p className="text-center text-base italic text-muted-foreground leading-snug">
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
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        {Array.from({ length: count }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-colors",
                                    index === current - 1 ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </Carousel>
            </div>
        </div>
    );
}
