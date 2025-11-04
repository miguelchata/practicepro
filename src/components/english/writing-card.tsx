
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardTitle } from '../ui/card';
import { ChevronsRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BlurredWord } from '@/components/english/blurred-word';
import { Separator } from '../ui/separator';
import type { VocabularyItem } from '@/lib/types';
import { Badge } from '../ui/badge';
import type { PracticeItem } from '@/app/(app)/english/practice/page';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

type WritingCardProps = {
    practiceItem: PracticeItem;
    updateWordStats: (item: VocabularyItem, quality: number, currentPracticeItem: PracticeItem) => Promise<VocabularyItem>;
    advanceToNextCard: (updatedItem: VocabularyItem) => void;
}

type FeedbackState = 'idle' | 'showingResult' | 'showingAccuracy' | 'showingFinal';


export function WritingCard({ practiceItem, updateWordStats, advanceToNextCard }: WritingCardProps) {
  const { wordData } = practiceItem;
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [itemToAdvance, setItemToAdvance] = useState<VocabularyItem | null>(null);
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  
  useEffect(() => {
    // Reset state for next card
    setUserInput('');
    setIsCorrect(false);
    setFeedbackState('idle');
    setItemToAdvance(null);
    setNewAccuracy(null);
    setShowExamples(false);
  }, [wordData.id]);
  
  useEffect(() => {
    if (feedbackState === 'showingResult') {
      const timer = setTimeout(() => setFeedbackState('showingAccuracy'), 400);
      return () => clearTimeout(timer);
    }
    if (feedbackState === 'showingAccuracy') {
      const timer = setTimeout(() => setFeedbackState('showingFinal'), 400);
      return () => clearTimeout(timer);
    }
  }, [feedbackState]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== 'idle') return;
    
    const correct = userInput.trim().toLowerCase() === wordData.word.toLowerCase();
    setIsCorrect(correct);
    
    const quality = correct ? 5 : 1;
    const updatedItem = await updateWordStats(wordData, quality, practiceItem);
    
    setItemToAdvance(updatedItem);
    setNewAccuracy((updatedItem.accuracy ?? 0) * 100);
    setFeedbackState('showingResult');
  };

  const handleContinue = () => {
    if (!itemToAdvance) return;
    advanceToNextCard(itemToAdvance);
  }
  
  const handleShowExamples = () => {
    setShowExamples(true);
  }


  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Writing Practice</p>
                 {wordData.type && <Badge variant="outline">{wordData.type}</Badge>}
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <p className="text-muted-foreground text-lg">{wordData.definition}</p>
            </div>
            
             {wordData.examples && wordData.examples.length > 0 && !showExamples && feedbackState === 'idle' && (
                <div className="text-center">
                    <Button variant="outline" onClick={handleShowExamples}>Show Examples</Button>
                </div>
            )}

            {wordData.examples && wordData.examples.length > 0 && (showExamples || feedbackState !== 'idle') && (
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
                                      &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={feedbackState !== 'idle' && !isCorrect} />&quot;
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
            
            {feedbackState === 'idle' && (
                 <form onSubmit={handleSubmit} className="pt-4 space-y-4">
                    <div className="relative">
                        <Input 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type the word..."
                            className="h-12 text-center text-lg font-mono tracking-widest"
                            disabled={feedbackState !== 'idle'}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    </div>
                    <Button type="submit" className="w-full">Check Answer</Button>
                </form>
            )}


            {feedbackState !== 'idle' && (
                <div className="space-y-4 text-center pt-4">
                     <div className="rounded-lg border bg-muted/50 p-4 space-y-4 min-h-[140px] flex flex-col justify-center">
                        <div className="text-center space-y-1">
                          <CardTitle className={`font-headline text-4xl ${!isCorrect && 'text-primary'}`}>{wordData.word}</CardTitle>
                          {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
                        </div>
                        
                        <div className={cn('transition-opacity duration-300', feedbackState === 'showingResult' ? 'opacity-100' : 'opacity-0 h-0')}>
                            <div className={`relative rounded-md p-2 font-semibold ${isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                <p>{isCorrect ? "Correct!" : "Incorrect."}</p>
                            </div>
                        </div>

                        <div className={cn('transition-opacity duration-300', feedbackState === 'showingAccuracy' ? 'opacity-100' : 'opacity-0 h-0')}>
                          {newAccuracy !== null && (
                              <div className="space-y-2 text-center pt-2">
                                  <Progress value={newAccuracy} />
                                  <p className="text-sm font-medium text-muted-foreground">Accuracy: {Math.round(newAccuracy ?? 0)}%</p>
                              </div>
                          )}
                        </div>

                        <div className={cn('transition-opacity duration-300', feedbackState === 'showingFinal' ? 'opacity-100' : 'opacity-0 h-0')}>
                          {!isCorrect && (
                              <div className="relative rounded-md bg-destructive/10 p-2 text-destructive">
                                  <p className="text-sm">You wrote: <span className="font-mono font-semibold">{userInput}</span></p>
                              </div>
                          )}
                          <Button onClick={handleContinue} className="w-full mt-4">
                              Continue <ChevronsRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
