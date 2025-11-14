'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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

// import type { PracticeItem } from "@/app/(app)/english/practice/page";
// import { set } from "date-fns";
import { PracticeItem } from "@/lib/types";

type FlashcardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<number | null>;
  nextCard: (item: PracticeItem) => void;
};
type FeedbackState = "idle" | "showingAccuracy";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function Flashcard({
  practiceItem,
  handleFeedback,
  nextCard,
}: FlashcardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [items, setItems] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // timeout ref so we can clear delayed navigation on unmount
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset local state when the card changes
  useEffect(() => {
    setShowExamples(false);
    setShowWord(false);
    setFeedbackState("idle");
    setItems([]);
    setNewAccuracy(null);
    setProcessing(false);

    console.log("show defaul values", wordData.id);
    console.log("resetting state");

    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    };
  }, [wordData.id]);

  const handleShowAnswer = useCallback(() => {
    setShowWord(true);
  }, []);

  const handleShowExamples = useCallback(() => {
    setShowExamples(true);
  }, []);

  // derived UI helpers
  const progressPercent = useMemo(() => {
    return newAccuracy !== null ? Math.round(newAccuracy * 100) : 0;
  }, [newAccuracy]);

  const onFeedback = async (quality: number) => {
    if (!showWord) return;
    if (feedbackState !== "idle") return;

    console.log("onFeedback", quality);

    setProcessing(true);
    setFeedbackState("idle"); // keep explicit
    const accuracy = await handleFeedback(quality);

    console.log("onFeedback result", accuracy);

    pendingTimeout.current = setTimeout(() => {
      setProcessing(false);
      setNewAccuracy(accuracy ?? null);
      setItems([`Vocabulary progress: ${Math.round((accuracy ?? 0) * 100)}%`]);
      setFeedbackState("showingAccuracy");
    }, 800);
  };

  // callback handed to FeedbackSlide when it finishes.
  // we await a short delay for UX and then call nextCard.
  const handleFeedbackSlideFinish = async () => {
    // small pause (same behavior as your previous 800ms setTimeout)
    await new Promise<void>((resolve) => {
      const id = window.setTimeout(() => resolve(), 800);
      timeoutRef.current = id;
    });
    console.log("handleFeedbackSlideFinish");

    nextCard(practiceItem);
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
          ) : feedbackState === "idle" ? (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <p className="text-center font-semibold">
                How well did you remember it?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="destructive"
                  className="h-auto"
                  onClick={() => onFeedback(1)}
                  disabled={processing}
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
                  disabled={processing}
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
                  disabled={processing}
                >
                  <div className="flex flex-col items-center p-2">
                    <span className="font-bold">YES</span>
                    <span className="text-xs font-normal">I've learned</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : feedbackState === "showingAccuracy" ? (
            <FeedbackSlide
              items={items}
              onFinish={() => nextCard(practiceItem)}
              duration={800}
              progress={progressPercent}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
