
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
import { Progress } from '../ui/progress';
import type { PracticeItem } from '@/app/(app)/english/practice/page';

type FlashcardProps = {
    practiceItem: PracticeItem;
    updateWordStats: (item: VocabularyItem, quality: number, currentPracticeItem: PracticeItem) => Promise<VocabularyItem>;
    advanceToNextCard: (updatedItem: VocabularyItem) => void;
}

type FeedbackState = 'idle' | 'answerVisible' | 'showingAccuracy';

export function Flashcard({ practiceItem, updateWordStats, advanceToNextCard }: FlashcardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);

  const handleShowAnswer = () => {
    setFeedbackState('answerVisible');
  }

  const handleFeedback = async (quality: number) => {
    if (feedbackState !== 'answerVisible') return;
    
    const updatedItem = await updateWordStats(wordData, quality, practiceItem);
    setNewAccuracy((updatedItem.accuracy ?? 0) * 100);
    setFeedbackState('showingAccuracy');
    
    // Automatically advance after a short delay
    setTimeout(() => {
        advanceToNextCard(updatedItem);
    }, 800);
  }

  useEffect(() => {
    // Reset state when wordData changes
        setShowExamples(false);
        setFeedbackState('idle');
        setNewAccuracy(null);
  }, [wordData]);
  
  const handleShowExamples = () => {
    setShowExamples(true);
  }

  const wordIsVisible = feedbackState === 'answerVisible' || feedbackState === 'showingAccuracy';

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
        
        {wordData.examples && wordData.examples.length > 0 && !showExamples && !wordIsVisible && (
            <div className="text-center">
                <Button variant="outline" onClick={handleShowExamples}>Show Examples</Button>
            </div>
        )}
        
        {wordData.examples && wordData.examples.length > 0 && (showExamples || wordIsVisible) && (
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
                                        &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={wordIsVisible} />&quot;
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

        {wordIsVisible && (
            <div className="text-center pt-4 space-y-1">
                <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
            </div>
        )}


        <div className="pt-6">
            {feedbackState === 'idle' ? (
                <div className="text-center">
                    <Button onClick={handleShowAnswer}>Show Answer</Button>
                </div>
            ) : feedbackState === 'answerVisible' ? (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                    <p className="text-center font-semibold">How well did you remember it?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button variant="destructive" className="h-auto" onClick={() => handleFeedback(1)}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">NO</span>
                                <span className="text-xs font-normal">Repeat</span>
                            </div>
                        </Button>
                            <Button variant="outline" className="h-auto" onClick={() => handleFeedback(3)}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">Sort of</span>
                                <span className="text-xs font-normal">Keep studying</span>
                            </div>
                        </Button>
                            <Button variant="default" className="h-auto" onClick={() => handleFeedback(5)}>
                            <div className="flex flex-col items-center p-2">
                                <span className="font-bold">YES</span>
                                <span className="text-xs font-normal">I've learned</span>
                            </div>
                        </Button>
                    </div>
                </div>
            ) : feedbackState === 'showingAccuracy' ? (
                 <div className="space-y-2 text-center">
                    <Progress value={newAccuracy} />
                    <p className="text-sm font-medium text-muted-foreground">Accuracy: {Math.round(newAccuracy ?? 0)}%</p>
                </div>
            ) : null}
        </div>
        </CardContent>
    </Card>
  );
}
