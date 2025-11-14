
'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "../ui/progress";
import type { PracticeItem } from "@/lib/types";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";

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

  const handleToggleExamples = () => {
    setShowExamples(prev => !prev);
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
            <ExampleCard 
                wordData={wordData}
                show={showExamples}
                onToggle={handleToggleExamples}
                showFullWord={showWord}
            />
            <WordCard wordData={wordData} show={showWord} />
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
                <div className="flex items-center gap-4 justify-center">
                    <span className="text-sm font-medium text-center">
                    Vocabulary progress: {Math.round(progressPercent)}%
                    </span>
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
