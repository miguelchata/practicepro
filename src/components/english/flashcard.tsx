'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// import { CardTitle } from '../ui/card';
import type { VocabularyItem } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { FeedbackSlide } from "./feeback-slide";

import type {
  PracticeItem,
  FeedbackState,
} from "@/app/(app)/english/practice/page";

type FlashcardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<number>;
  nextCard: () => void;
  again: string;
};

export function Flashcard({
  practiceItem,
  handleFeedback,
  nextCard,
  again,
}: FlashcardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [feedback, setFeedback] = useState("idle");
  const [items, setItems] = useState<string[]>([]);
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);

  const handleShowAnswer = () => {
    setShowWord(true);
  };

  const onFeedback = async (quality: number) => {
    if (!showWord || feedback !== "idle") return;

    const accuracy = await handleFeedback(quality);
    setNewAccuracy(accuracy);

    setItems([`Vocabulary progress: ${Math.round((accuracy ?? 0) * 100)}%`]);
    setFeedback("showingAccuracy");
  };

  // Reset local state when the card changes
  useEffect(() => {
    setShowExamples(false);
    setShowWord(false);
    setFeedback("idle");
    setItems([]);
    setNewAccuracy(null);
  }, [wordData.id, again]);

  const handleShowExamples = () => {
    setShowExamples(true);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="min-h-[2rem]">
          <p className="text-sm font-medium text-muted-foreground">
            Can you remember the vocab?
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-[3rem]">
          <Badge variant="outline">{wordData.type}</Badge>
          <p className="text-muted-foreground text-lg">{wordData.definition}</p>
        </div>

        <div className="relative flex flex-col justify-center">
          <div className="min-h-[6rem] flex flex-col justify-center">
            {wordData.examples &&
              wordData.examples.length > 0 &&
              !showExamples &&
              !showWord && (
                <div className="text-center">
                  <Button variant="outline" onClick={handleShowExamples}>
                    Show Examples
                  </Button>
                </div>
              )}

            {wordData.examples &&
              wordData.examples.length > 0 &&
              (showExamples || showWord) && (
                <>
                  <Separator />
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
                                &quot;
                                <BlurredWord
                                  sentence={example}
                                  wordToBlur={wordData.word}
                                  showFullWord={showWord}
                                />
                                &quot;
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
          </div>

          <div className="min-h-[4rem] flex flex-col justify-center">
            {showWord && (
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
            )}
          </div>
        </div>

        <div className="pt-6 min-h-[8rem] flex flex-col justify-center">
          {!showWord ? (
            <div className="text-center">
              <Button onClick={handleShowAnswer}>Show Answer</Button>
            </div>
          ) : feedback === "idle" ? (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <p className="text-center font-semibold">
                How well did you remember it?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="destructive"
                  className="h-auto"
                  onClick={() => onFeedback(1)}
                >
                  <div className="flex flex-col items-center p-2">
                    <span className="font-bold">NO</span>
                    <span className="text-xs font-normal">Repeat</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto"
                  onClick={() => onFeedback(3)}
                >
                  <div className="flex flex-col items-center p-2">
                    <span className="font-bold">Sort of</span>
                    <span className="text-xs font-normal">Keep studying</span>
                  </div>
                </Button>
                <Button
                  variant="default"
                  className="h-auto"
                  onClick={() => onFeedback(5)}
                >
                  <div className="flex flex-col items-center p-2">
                    <span className="font-bold">YES</span>
                    <span className="text-xs font-normal">I've learned</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : feedback === "showingAccuracy" ? (
            <FeedbackSlide
              items={items}
              onFinish={() => {
                nextCard();
                console.log("finished");
              }}
              duration={800}
              progress={newAccuracy !== null ? newAccuracy * 100 : 0}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
