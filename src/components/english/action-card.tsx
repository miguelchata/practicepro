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
            <div className="space-y-6 text-center px-2">
              {status.typed && (
                  <div className="bg-muted p-3 rounded-lg border border-border/50">
                    <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Your response</p>
                    <p className="text-lg font-mono font-semibold break-all">
                      {status.typed}
                    </p>
                  </div>
              )}
              <Button
                type="button"
                size="lg"
                className="w-full h-16 text-xl font-headline tracking-tight shadow-md rounded-xl active:scale-[0.98] transition-all"
                onClick={() => handleNextCard()}
              >
                Continue
              </Button>
            </div>
        )
    }

    if (status.process === "feedback") {
        return (
            <div className="w-full py-4">
                <AccuracyCard accuracy={status.accuracy} nextCard={toContinue} />
            </div>
        )
    }

    return (
        <div className="px-2">
            <FormCard
                handleCheckAnswer={handleCheckAnswer}
                inputDisabled={false}
                answer={practiceItem.wordData.word}
            />
        </div>
    )
}
