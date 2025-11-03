
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { BlurredWord } from '@/components/english/blurred-word';
import { CardTitle } from '../ui/card';

type WordData = {
    word: string;
    type: string;
    definition: string;
    examples: string[];
    learned: boolean;
    ipa: string;
};

type FlashcardProps = {
    wordData: WordData;
    onNext: (isCorrect?: boolean) => void;
}

export function Flashcard({ wordData, onNext }: FlashcardProps) {
  const [showWord, setShowWord] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleShowAnswer = () => {
    setShowWord(true);
  }

  const handleFeedback = () => {
    setShowWord(false);
    setShowExamples(false);
    onNext(true); // Flashcard review is always "correct" for session progress
  }

  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">{wordData.type}</p>
        </CardHeader>
        <CardContent className="space-y-6">
        <div>
            <p className="text-muted-foreground text-lg">{wordData.definition}</p>
        </div>
        
        {!showExamples && !showWord && (
            <div className="text-center pt-4">
                <Button variant="outline" onClick={() => setShowExamples(true)}>Show Examples</Button>
            </div>
        )}

        {showExamples && !showWord && (
            <>
                <Separator/>
                <div className="relative pt-6">
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full px-4"
                    >
                        <CarouselContent>
                            {wordData.examples.map((example, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                <p className="text-center text-lg italic text-muted-foreground">
                                    &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={showWord} />&quot;
                                </p>
                                </div>
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </>
        )}

        {showWord && (
            <>
             <Separator/>
                <div className="relative pt-6">
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full px-4"
                    >
                        <CarouselContent>
                            {wordData.examples.map((example, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                <p className="text-center text-lg italic text-muted-foreground">
                                    &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={showWord} />&quot;
                                </p>
                                </div>
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            <div className="text-center pt-4 space-y-1">
                <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>
            </div>
            </>
        )}


            <div className="pt-6">
            {!showWord ? (
                <div className="text-center">
                    <Button onClick={handleShowAnswer}>Show Answer</Button>
                </div>
            ) : (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                    <p className="text-center font-semibold">Did you remember it right?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="destructive" className="h-auto" onClick={handleFeedback}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">NO</span>
                                <span className="text-xs font-normal">Repeat</span>
                            </div>
                        </Button>
                            <Button variant="outline" className="h-auto" onClick={handleFeedback}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">Sort of</span>
                                <span className="text-xs font-normal">Keep studying</span>
                            </div>
                        </Button>
                            <Button variant="default" className="h-auto" onClick={handleFeedback}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">YES</span>
                                <span className="text-xs font-normal">I've learned</span>
                            </div>
                        </Button>
                    </div>
                </div>
            )}
        </div>
        </CardContent>
    </Card>
  );
}
