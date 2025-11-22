
'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "../ui/progress";
import { DetailCard } from "./detail-card";
import { ExampleCard } from "./example-card";
import { WordCard } from "./word-card";
import { ActionCard } from "./action-card"
import type { PracticeItem } from "@/lib/types";
import type { VocabularyItem } from "@/lib/types";

type WritingCardProps = {
  practiceItem: PracticeItem;
  handleFeedback: (quality: number) => Promise<VocabularyItem | null>;
  nextCard: (item: PracticeItem) => void;
};

export function WritingCard({
  practiceItem,
  handleFeedback,
  nextCard,
}: WritingCardProps) {
  const { wordData } = practiceItem;
  const [showExamples, setShowExamples] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [status, setStatus] = useState<{
      accuracy: number | null;
      process: "initial" | "answer" | "feedback" | "continue"
      item: VocabularyItem | null;
      typed: string
    }>({ accuracy: null, process: "initial", item: null,  typed: "" });

  // useEffect(() => {
  //   setUserInput("");
  //   setIsCorrect(false);
  //   setShowExamples(false);
  //   setFeedbackState("idle");
  //   setNewAccuracy(null);
  //   processingRef.current = false;
  // }, [wordData.id]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (feedbackState !== "idle" || processingRef.current) return;
    
  //   processingRef.current = true;
  //   const correct = userInput.trim().toLowerCase() === wordData.word.toLowerCase();
  //   setIsCorrect(correct);
  //   setShowExamples(true); 
  //   setFeedbackState("showingResult");
    
  //   const quality = correct ? 5 : 1;
  //   const accuracy = await handleFeedback(quality);
  //   // setNewAccuracy(accuracy);

  //   setTimeout(() => {
  //       setFeedbackState('showingAccuracy');
  //   }, 1200);
  // };

  const handleToggleExamples = () => {
    setShowExamples(prev => !prev);
  };
  
  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (feedbackState === 'showingAccuracy') {
  //     timer = setTimeout(() => setFeedbackState('showingFinal'), 1200);
  //   }
  //   return () => clearTimeout(timer);
  // }, [feedbackState]);

  const handleShowAnswer = () => {
    setShowWord(true);
    setShowExamples(true); // Also show examples when answer is revealed
    setStatus((s) => ({ ...s, process: "answer" }));
  };

  const handleCheckAnswer = async (wordTyped: string) => {
    const correct = wordTyped === wordData.word.toLowerCase();
    const itemUpdated = await handleFeedback(correct ? 5 : 3);
    
    console.log(correct, " correct...", wordTyped);
    setTimeout(() => {
      if (itemUpdated) {
        setStatus((s) => ({
          ...s,
          item: itemUpdated,
          typed: wordTyped,
          accuracy: itemUpdated.accuracy,
          process: "feedback",
        }));
      }
    } , 1200);
  }

  const toContinue = () => {
    setStatus((s) => ({
      ...s,
      process: "continue",
    }));
  }
  
  const handleNextCard = () => {
    if (status.item) {
      const itemToUpdate = { ...practiceItem, wordData: status.item };
      nextCard(itemToUpdate);
    } 
    console.log("write in next card", status.item)
  };
  const showExampleIf = status.process === "feedback" || status.process === "continue" || showExamples;
  const showWordIf = status.process === "feedback" || status.process === "continue" || showWord;;
  

  return (
    <Card className="w-full">
      <CardHeader>
        <DetailCard wordData={wordData} promptText="Writing Practice" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex flex-col justify-center">
            <ExampleCard 
                wordData={wordData}
                show={showExampleIf}
                onToggle={handleToggleExamples}
                showFullWord={showExampleIf}
            />
            <WordCard wordData={wordData} show={showWordIf} />
        </div>

        <div className="pt-6 min-h-[8rem] flex flex-col justify-center">
          <ActionCard
            status={status}
            handleCheckAnswer={handleCheckAnswer}
            toContinue={toContinue}
            practiceItem={practiceItem}
            handleNextCard={handleNextCard}
          />
          {/*feedbackState === "idle" ? (
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
                    Vocabulary progress: {Math.round(newAccuracy !== null ? newAccuracy * 100 : 0)}%
                    </span>
                </div>
                <Progress value={newAccuracy !== null ? newAccuracy * 100 : 0} />
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
          )*/}
        </div>
      </CardContent>
    </Card>
  );
}
