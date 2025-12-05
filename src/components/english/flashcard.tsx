
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PracticeItem } from "@/lib/types";
import type { VocabularyItem } from "@/lib/types";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";
import { ControlCard } from "./control-card";
import { Button } from "@/components/ui/button";
import { useUpdateVocabularyItem } from "@/firebase/firestore/use-vocabulary";

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
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<{
    accuracy: number | null;
    process: "initial" | "answer" | "feedback" | "continue";
    item: VocabularyItem | null;
  }>({ accuracy: null, process: "initial", item: null });

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

  const toContinue = () => {
    // This function will be called by AccuracyCard to signal it's time for the continue button
    setStatus((s) => ({
        ...s,
        process: "continue",
    }));
  }

  const handleNextCard = async () => {
    if (status.item) {
      await updateVocabularyItem(status.item.id, status.item);
      nextCard(status.item);
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
           {status.process === 'continue' ? (
                <div className="space-y-4 text-center">
                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleNextCard}
                    >
                        Continue
                    </Button>
                </div>
            ) : (
                <ControlCard
                    status={status}
                    onFeedback={onFeedback}
                    isProcessing={processing}
                    handleShowAnswer={handleShowAnswer}
                    nextCard={toContinue} // Pass the function to transition to 'continue' state
                />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
