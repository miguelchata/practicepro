
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PracticeItem } from "@/lib/types";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";
import { ControlCard } from "./control-card";

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

  useEffect(() => {
    if (feedbackState === 'showingAccuracy') {
      const timer = setTimeout(() => {
        nextCard(practiceItem);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [feedbackState, nextCard, practiceItem]);


  return (
    <Card className="w-full">
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
          ) : (
            <ControlCard 
              accuracy={newAccuracy}
              onFeedback={onFeedback}
              isProcessing={processing}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
