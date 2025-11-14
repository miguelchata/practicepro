'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { CardTitle } from '../ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BlurredWord } from "@/components/english/blurred-word";
import { Separator } from "../ui/separator";
import type { VocabularyItem } from "@/lib/types";
import { Badge } from "../ui/badge";
import { PracticeItem } from "@/lib/types";
import { Progress } from "../ui/progress";
import { FeedbackSlide } from "./feeback-slide";
import { set } from "date-fns";

type WritingCardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<number | null>;
  nextCard: () => void;
};

export function WritingCard({
  practiceItem,
  handleFeedback,
  nextCard,
}: WritingCardProps) {
  const { wordData } = practiceItem;
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [feedback, setFeedback] = useState("idle");
  const [items, setItems] = useState<string[]>([]);
  const [showWord, setShowWord] = useState(false);
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);

  const processingRef = useRef(false);

  useEffect(() => {
    // Reset state for next card
    setUserInput("");
    setIsCorrect(false);
    setShowExamples(false);
    setFeedback("idle");
    setItems([]);
    setShowWord(false);
    setNewAccuracy(null);
  }, [wordData.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== "idle") return;
    setShowWord(true);

    const correct =
      userInput.trim().toLowerCase() === wordData.word.toLowerCase();

    setIsCorrect(correct);
    setShowExamples(true);

    const quality = correct ? 5 : 1;
    const accuracy = await handleFeedback(quality);
    setNewAccuracy(accuracy);

    setTimeout(() => {
      let slides = [
        `Vocabulary progress: ${Math.round((accuracy ?? 0) * 100)}%`,
      ];

      // if (correct === false)
      //   slides.push(`You wrote: ${userInput.trim().toLowerCase()}`);

      setItems(slides);
      setFeedback("showingAccuracy");
    }, 1200);
  };

  const handleShowExamples = () => {
    setShowExamples(true);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center min-h-[2rem]">
          <p className="text-sm font-medium text-muted-foreground">
            Writing Practice
          </p>
          {wordData.type && <Badge variant="outline">{wordData.type}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-[3rem]">
          <p className="text-muted-foreground text-lg">{wordData.definition}</p>
        </div>

        <div className="relative flex flex-col justify-center">
          <div className="min-h-[6rem] flex flex-col justify-center">
            {wordData.examples &&
              wordData.examples.length > 0 &&
              !showExamples &&
              feedback === "idle" && (
                <div className="text-center">
                  <Button variant="outline" onClick={handleShowExamples}>
                    Show Examples
                  </Button>
                </div>
              )}

            {(showExamples || feedback !== "idle") &&
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
          {feedback === "idle" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span>
                  {showExamples && isCorrect && "Correct answer. Nice one!"}
                  {showExamples &&
                    !isCorrect &&
                    "Incorrect answer. Keep trying!"}
                </span>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the word..."
                  className="h-12 text-center text-lg font-mono tracking-widest"
                  disabled={feedback !== "idle"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <Button type="submit" className="w-full">
                Check Answer
              </Button>
            </form>
          ) : feedback === "showingAccuracy" ? (
            <FeedbackSlide
              items={items}
              duration={800}
              onFinish={() => setFeedback("showingFinal")}
              progress={newAccuracy !== null ? newAccuracy * 100 : 0}
            />
          ) : (
            <>
              {!isCorrect && <span>You wrote:{userInput.trim()}</span>}
              <Button
                type="button"
                className="w-full"
                onClick={() => nextCard()}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

{
  /* <div className="rounded-lg border bg-muted/50 p-4 space-y-4 min-h-[140px] flex flex-col justify-center text-center">
              {feedbackState === "showingResult" && (
                <div
                  className={`relative rounded-md p-2 font-semibold ${
                    isCorrect
                      ? "bg-green-500/10 text-green-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <p>{isCorrect ? "Correct!" : "Incorrect."}</p>
                </div>
              )}
              {feedbackState === "showingAccuracy" && newAccuracy !== null && (
                <div className="space-y-2 text-center pt-2">
                  <Progress value={newAccuracy} />
                  <p className="text-sm font-medium text-muted-foreground">
                    Accuracy: {Math.round(newAccuracy ?? 0)}%
                  </p>
                </div>
              )}
              {feedbackState === "showingFinal" && (
                <>
                  {!isCorrect && (
                    <div className="relative rounded-md bg-destructive/10 p-2 text-destructive">
                      <p className="text-sm">
                        You wrote:{" "}
                        <span className="font-mono font-semibold">
                          {userInput}
                        </span>
                      </p>
                    </div>
                  )}
                  {isCorrect && (
                    <div className="relative rounded-md p-2 text-muted-foreground">
                      <p>Moving to the next card...</p>
                    </div>
                  )}
                </>
              )}
            </div> */
}
