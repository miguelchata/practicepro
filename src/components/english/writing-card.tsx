'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";
import { ActionCard } from "./action-card"
import type { PracticeItem } from "@/lib/types";
import type { VocabularyItem } from "@/lib/types";
import { useUpdateVocabularyItem } from "@/firebase/firestore/use-vocabulary";

type WritingCardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<VocabularyItem | null>;
  nextCard: () => void;
};

export function WritingCard({
  practiceItem,
  handleFeedback,
  nextCard,
}: WritingCardProps) {
  const { wordData } = practiceItem;
  const updateVocabularyItem = useUpdateVocabularyItem();
  const [showExamples, setShowExamples] = useState(false);
  const [status, setStatus] = useState<{
      accuracy: number | null;
      process: "initial" | "answer" | "feedback" | "continue"
      item: VocabularyItem | null;
      typed: string
    }>({ accuracy: null, process: "initial", item: null,  typed: "" });

  const handleToggleExamples = () => {
    setShowExamples(prev => !prev);
  };
  
  const handleCheckAnswer = async (wordTyped: string) => {
    const correct = wordTyped.toLowerCase().trim() === wordData.word.toLowerCase();
    
    setStatus(s => ({...s, process: 'answer', typed: wordTyped }));

    // Give feedback to the user immediately
    const quality = correct ? 5 : 1;
    const itemUpdated = await handleFeedback(quality);
    
    // After a short delay, move to the accuracy display
    setTimeout(() => {
      if (itemUpdated) {
        setStatus((s) => ({
          ...s,
          item: itemUpdated,
          accuracy: itemUpdated.accuracy,
          process: "feedback",
        }));
      }
    } , correct ? 800 : 1500);
  }

  const toContinue = () => {
    setStatus((s) => ({
      ...s,
      process: "continue",
    }));
  }
  
  const handleNextCard = async () => {
    if (status.item) {
      await updateVocabularyItem(status.item.id, status.item);
      nextCard();
    } 
  };
  
  const showExampleIf = status.process !== "initial" || showExamples;
  const showWordIf = status.process !== "initial";

  return (
    <Card className="w-full max-w-md h-full md:h-auto max-h-[85vh] flex flex-col border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="px-4 py-4 shrink-0">
        <DetailCard wordData={wordData} promptText="Writing Practice" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 pb-4">
        <div className="relative flex flex-col justify-center">
            <ExampleCard 
                wordData={wordData}
                show={showExampleIf}
                onToggle={handleToggleExamples}
                showFullWord={showWordIf}
            />
            <WordCard wordData={wordData} show={showWordIf} />
        </div>
      </CardContent>
      <CardContent className="px-4 py-4 shrink-0 bg-background md:bg-transparent">
          <ActionCard
            status={status}
            handleCheckAnswer={handleCheckAnswer}
            toContinue={toContinue}
            practiceItem={practiceItem}
            handleNextCard={handleNextCard}
          />
      </CardContent>
    </Card>
  );
}
