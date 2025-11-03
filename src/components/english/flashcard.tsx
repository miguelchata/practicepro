
'use client';

import { useState, useEffect } from 'react';
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
import type { VocabularyItem } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ChevronsRight } from 'lucide-react';

type FlashcardProps = {
    wordData: VocabularyItem;
    onAdvance: (quality: number) => void; // Function to advance to the next card
}

export function Flashcard({ wordData, onAdvance }: FlashcardProps) {
  const [showWord, setShowWord] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleShowAnswer = () => {
    setShowWord(true);
  }

  const handleFeedback = (quality: number) => {
    setFeedbackGiven(true);
    // Automatically advance after a short delay
    setTimeout(() => {
        onAdvance(quality);
    }, 800);
  }

  useEffect(() => {
    // Reset state when wordData changes
    setShowWord(false);
    setShowExamples(false);
    setFeedbackGiven(false);
  }, [wordData]);
  
  const handleShowExamples = () => {
    setShowExamples(true);
  }

  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Can you remember the vocab?</p>
                {wordData.type && <Badge variant="outline">{wordData.type}</Badge>}
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
        <div>
            <p className="text-muted-foreground text-lg">{wordData.definition}</p>
        </div>
        
        {wordData.examples && wordData.examples.length > 0 && !showExamples && !showWord && (
            <div className="text-center">
                <Button variant="outline" onClick={handleShowExamples}>Show Examples</Button>
            </div>
        )}
        
        {wordData.examples && wordData.examples.length > 0 && (showExamples || showWord) && (
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
            <div className="text-center pt-4 space-y-1">
                <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
            </div>
        )}


        <div className="pt-6">
            {!showWord ? (
                <div className="text-center">
                    <Button onClick={handleShowAnswer}>Show Answer</Button>
                </div>
            ) : (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                    <p className="text-center font-semibold">How well did you remember it?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="destructive" className="h-auto" onClick={() => handleFeedback(1)} disabled={feedbackGiven}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">NO</span>
                                <span className="text-xs font-normal">Repeat</span>
                            </div>
                        </Button>
                            <Button variant="outline" className="h-auto" onClick={() => handleFeedback(3)} disabled={feedbackGiven}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">Sort of</span>
                                <span className="text-xs font-normal">Keep studying</span>
                            </div>
                        </Button>
                            <Button variant="default" className="h-auto" onClick={() => handleFeedback(5)} disabled={feedbackGiven}>
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
