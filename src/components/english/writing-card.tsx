
'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BlurredWord } from "@/components/english/blurred-word";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import type { PracticeItem } from "@/lib/types";
import { DetailCard } from "./detail-card";

type WritingCardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<number | null>;
  nextCard: (item: PracticeItem) => void;
};

type FeedbackState = 'idle' | 'showingResult' | 'showingAccuracy' | 'showingFinal';

export function WritingCard({
  practiceItem,
  handleFeedback,
  nextCard,
}: WritingCardProps) {
  const { wordData } = practiceItem;
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    setUserInput("");
    setIsCorrect(false);
    setShowExamples(false);
    setFeedbackState("idle");
    setNewAccuracy(null);
    processingRef.current = false;
  }, [wordData.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackState !== "idle" || processingRef.current) return;
    
    processingRef.current = true;
    const correct = userInput.trim().toLowerCase() === wordData.word.toLowerCase();
    setIsCorrect(correct);
    setShowExamples(true); 
    setFeedbackState("showingResult");
    
    const quality = correct ? 5 : 1;
    const accuracy = await handleFeedback(quality);
    setNewAccuracy(accuracy);

    setTimeout(() => {
        setFeedbackState('showingAccuracy');
    }, 1200);
  };

  const handleShowExamples = () => {
    setShowExamples(true);
  };
  
  const progressPercent = useMemo(() => {
    return newAccuracy !== null ? newAccuracy * 100 : 0;
  }, [newAccuracy]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (feedbackState === 'showingAccuracy') {
      timer = setTimeout(() => setFeedbackState('showingFinal'), 1200);
    }
    return () => clearTimeout(timer);
  }, [feedbackState]);


  const showWord = feedbackState !== 'idle';
  const inputDisabled = feedbackState !== 'idle';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <DetailCard wordData={wordData} promptText="Writing Practice" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex flex-col justify-center">
          <div className="min-h-[6rem] flex flex-col justify-center">
            {wordData.examples &&
              wordData.examples.length > 0 &&
              !showExamples &&
              feedbackState === "idle" && (
                <div className="text-center">
                  <Button variant="outline" onClick={handleShowExamples}>
                    Show Examples
                  </Button>
                </div>
              )}

            {(showExamples || feedbackState !== "idle") &&
              wordData.examples &&
              wordData.examples.length > 0 && (
                <>
                  <Separator />
                  <div className="relative pt-6">
                    <Carousel opts={{ align: "start" }} className="w-full px-4">
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
                <CardTitle className={`font-headline text-4xl`}>
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
          {feedbackState === "idle" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word..."
                className="h-12 text-center text-lg font-mono tracking-widest"
                disabled={inputDisabled}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              <Button type="submit" className="w-full" disabled={inputDisabled}>
                Check Answer
              </Button>
            </form>
          ) : feedbackState === "showingResult" ? (
             <div
                className={`relative rounded-md p-2 font-semibold text-center ${
                  isCorrect
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <p>{isCorrect ? "Correct!" : "Incorrect."}</p>
              </div>
          ) : feedbackState === 'showingAccuracy' ? (
             <div className="w-full px-4 space-y-2">
              <div className="text-sm font-medium text-center">
                 Vocabulary progress: {progressPercent}%
              </div>
              <Progress value={progressPercent} />
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {!isCorrect && (
                  <p className="text-sm text-destructive">
                    You wrote:{" "}
                    <span className="font-mono font-semibold">{userInput}</span>
                  </p>
              )}
              <Button
                type="button"
                className="w-full"
                onClick={() => nextCard(practiceItem)}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
