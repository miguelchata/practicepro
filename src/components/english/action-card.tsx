import { Button } from "@/components/ui/button";
import { FormCard } from "./form-card"
import { AccuracyCard } from "./accuracy-card";
import type { PracticeItem } from "@/lib/types";

type ActionCardProps = {
    status: {
        process: "initial" | "answer" | "feedback" | "continue"
        accuracy: number | null;
        typed: string
    };
    handleCheckAnswer: (wordTyped: string) => void;
    practiceItem: PracticeItem;
    toContinue: () => void
    handleNextCard: () => void
}


export const ActionCard = ({ status, handleCheckAnswer, toContinue, handleNextCard, practiceItem }: ActionCardProps) => {

    if (status.process === "continue") {
        return (
            <div className="space-y-4 text-center">
              {status.typed && (
                  <p className="text-sm text-destructive">
                    You wrote:{" "}
                    <span className="font-mono font-semibold">{status.typed}</span>
                  </p>
              )}
              <Button
                type="button"
                className="w-full"
                onClick={() => handleNextCard()}
              >
                Continue
              </Button>
            </div>
        )
    }

    if (status.process === "feedback") {
        return <AccuracyCard accuracy={status.accuracy} nextCard={toContinue}  />
    }

    return (
        <FormCard
            handleCheckAnswer={handleCheckAnswer}
            inputDisabled={false}
            answer={practiceItem.wordData.word}
        />
    )
}