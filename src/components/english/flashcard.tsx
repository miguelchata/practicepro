
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PracticeItem } from "@/lib/types";
import type { VocabularyItem } from "@/lib/types";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";
import { ControlCard } from "./control-card";

type FlashcardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<VocabularyItem | null>;
  nextCard: (item: VocabularyItem) => void;
};

export function Flashcard({
  practiceItem,
  handleFeedback,
  nextCard,
}: FlashcardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<{
    accuracy: number | null;
    process: "initial" | "answer" | "feedback";
    item: VocabularyItem | null;
  }>({ accuracy: null, process: "initial", item: null });

  // Reset local state when the card changes
  useEffect(() => {
    setShowExamples(false);
    setShowWord(false);
    setProcessing(false);
    setStatus({ accuracy: null, item: null, process: "initial" });
  }, [wordData.id]);

  const handleShowAnswer = () => {
    setShowWord(true);
    setShowExamples(true); // Also show examples when answer is revealed
    setStatus((s) => ({ ...s, process: "answer" }));
  };

  const handleToggleExamples = () => {
    setShowExamples((prev) => !prev);
  };

  const onFeedback = async (quality: number) => {
    if (processing) return;

    setProcessing(true);
    const itemUpdated = await handleFeedback(quality);

    if (itemUpdated)
      setStatus((s) => ({
        ...s,
        item: itemUpdated,
        accuracy: itemUpdated.accuracy,
        process: "feedback",
      }));
  };

  const handleNextCard = () => {
    if (status.process === "feedback") {
      if (status.item) {
        nextCard(status.item);
      }
    }
  };


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
            showFullWord={showWord || status.process === "answer"}
          />

          <WordCard
            wordData={wordData}
            show={showWord || status.process === "answer"}
          />
        </div>

        <div className="pt-6 min-h-[8rem] flex flex-col justify-center">
          <ControlCard
            status={status}
            onFeedback={onFeedback}
            isProcessing={processing}
            handleShowAnswer={handleShowAnswer}
            nextCard={handleNextCard}
          />
        </div>
      </CardContent>
    </Card>
  );
}
