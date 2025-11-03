
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Check, X, ChevronsRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { BlurredWord } from '@/components/english/blurred-word';
import { Separator } from '../ui/separator';

type WordData = {
    word: string;
    type: string;
    definition: string;
    examples: string[];
    learned: boolean;
    ipa: string;
};

type WritingCardProps = {
    wordData: WordData;
    onNext: () => void;
}

export function WritingCard({ wordData, onNext }: WritingCardProps) {
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;
    const correct = userInput.trim().toLowerCase() === wordData.word.toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(false);
    onNext();
  }

  const getBorderColor = () => {
    if (!isSubmitted) return '';
    return isCorrect ? 'border-green-500' : 'border-destructive';
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
                                &quot;<BlurredWord sentence={example} wordToBlur={wordData.word} showFullWord={isSubmitted && isCorrect} />&quot;
                            </p>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            
            <form onSubmit={handleSubmit} className="pt-4 space-y-4">
                <div className="relative">
                    <Input 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type the word..."
                        className={cn("h-12 text-center text-lg font-mono tracking-widest", getBorderColor())}
                        disabled={isSubmitted}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                     {isSubmitted && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCorrect ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-destructive" />}
                        </div>
                    )}
                </div>

                {!isSubmitted && (
                    <Button type="submit" className="w-full">Check Answer</Button>
                )}
            </form>

            {isSubmitted && (
                <div className="space-y-4 text-center">
                    {!isCorrect && (
                         <div className="text-center pt-4 space-y-1">
                            <p className="text-sm text-muted-foreground">The correct answer is:</p>
                            <CardTitle className="font-headline text-4xl">{wordData.word}</CardTitle>
                            <p className="text-muted-foreground font-mono text-lg">{wordData.ipa}</p>
                        </div>
                    )}
                     <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                        <p className="text-center font-semibold">{isCorrect ? 'Excellent!' : 'Review this word'}</p>
                        <Button onClick={handleNext} className="w-full">
                            Next <ChevronsRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}

