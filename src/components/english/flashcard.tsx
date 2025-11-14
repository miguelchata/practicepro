
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "../ui/progress";
import type { PracticeItem } from "@/lib/types";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";

type FlashcardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<number | null>;
  nextCard: (item: PracticeItem) => void;
};

type FeedbackState = 'idle' | 'showingAccuracy';

export function Flashcard({
  practiceItem,
  handleFeedback,
  nextCard,
}: FlashcardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [newAccuracy, setNewAccuracy] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // Reset local state when the card changes
  useEffect(() => {
    setShowExamples(false);
    setShowWord(false);
    setFeedbackState('idle');
    setNewAccuracy(null);
    setProcessing(false);
  }, [wordData.id]);

  const handleShowAnswer = useCallback(() => {
    setShowWord(true);
    setShowExamples(true); // Also show examples when answer is revealed
  }, []);

  const handleToggleExamples = useCallback(() => {
    setShowExamples(prev => !prev);
  }, []);

  const onFeedback = async (quality: number) => {
    if (!showWord || feedbackState !== 'idle' || processing) return;

    setProcessing(true);
    const accuracy = await handleFeedback(quality);
    setNewAccuracy(accuracy);
    setFeedbackState('showingAccuracy');
  };
  
  const progressPercent = useMemo(() => {
    return newAccuracy !== null ? newAccuracy * 100 : 0;
  }, [newAccuracy]);

  useEffect(() => {
    if (feedbackState === 'showingAccuracy') {
      const timer = setTimeout(() => {
        nextCard(practiceItem);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [feedbackState, nextCard, practiceItem]);


  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <DetailCard wordData={wordData} />
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
          {!showWord ? (
            <div className="text-center">
              <Button onClick={handleShowAnswer}>Show Answer</Button>
            </div>
          ) : feedbackState === 'idle' ? (
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
          ) : feedbackState === 'showingAccuracy' ? (
            <div className="w-full px-4 space-y-2">
              <div className="flex items-center gap-4 justify-center">
                <span className="text-sm font-medium text-center">
                  Vocabulary progress: {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
