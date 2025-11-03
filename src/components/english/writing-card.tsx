
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

type WritingCardProps = {
    wordData: VocabularyItem;
    onNext: (quality: number) => void;
    onAdvance: () => void;
}

export function WritingCard({ wordData, onNext, onAdvance }: WritingCardProps) {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'checking' | 'result'>('idle');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== 'idle') return;
    
    const correct = userInput.trim().toLowerCase() === wordData.word.toLowerCase();
    setIsCorrect(correct);
    setFeedbackState('checking');
    onNext(correct ? 5 : 1);
  };

  useEffect(() => {
    if (feedbackState === 'checking') {
        const timer = setTimeout(() => {
            setFeedbackState('result');
        }, isCorrect ? 500 : 800);
        return () => clearTimeout(timer);
    }
  }, [feedbackState, isCorrect]);

  const handleContinue = () => {
    // Reset state for next card
    setUserInput('');
    setIsCorrect(false);
    setFeedbackState('idle');
    onAdvance();
  }


  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">Writing Practice</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <p className="text-muted-foreground text-lg">{wordData.definition}</p>
            </div>
            
            {wordData.examples.length > 0 && <Separator/>}
            {wordData.examples.length > 0 && (
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
                                    &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={feedbackState === 'result' && isCorrect} />&quot;
                                </p>
                              </div>
                          </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                  </Carousel>
              </div>
            )}
            
            {feedbackState === 'idle' ? (
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
            ) : (
                <div className="space-y-4 text-center pt-4">
                    {feedbackState === 'checking' && (
                         <div className={`relative rounded-md p-4 font-semibold ${isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                            <p>{isCorrect ? "Correct answer: nice one!" : "Incorrect answer: keep trying!"}</p>
                        </div>
                    )}

                    {feedbackState === 'result' && (
                        <>
                             {isCorrect ? (
                                <div className="text-center space-y-1">
                                    <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                                    {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
                                </div>
                            ) : (
                                <div className="text-center space-y-2">
                                    <CardTitle className="font-headline text-4xl text-primary">{wordData.word}</CardTitle>
                                    {wordData.ipa && <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>}
                                    <div className="relative rounded-md bg-destructive/10 p-2 text-destructive">
                                        <p className="text-sm">You wrote: <span className="font-mono font-semibold">{userInput}</span></p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg border bg-muted/50 p-4">
                                <Button onClick={handleContinue} className="w-full">
                                    Continue <ChevronsRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
